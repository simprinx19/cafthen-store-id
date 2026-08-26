import {
  CompanyProfileData,
  Product,
  TeamMember,
  ActivityPhoto,
  UserProfile,
  Order,
  DigitalContract,
  ExpenseRecord,
  ChatMessage,
  NotificationItem,
  PurchasePattern,
  ShippingMethod,
  PaymentMethod,
  UserType,
  FinancialReport,
  OrderStatus,
  PaymentSettingsState,
  PaymentMethodConfig,
  BankAccount,
  ThemeSettings
} from './types';
import {
  INITIAL_COMPANY_PROFILE,
  INITIAL_PRODUCTS,
  INITIAL_TEAM_MEMBERS,
  INITIAL_ACTIVITY_PHOTOS,
  INITIAL_USERS,
  INITIAL_ORDERS,
  INITIAL_EXPENSES,
  INITIAL_MESSAGES,
  INITIAL_NOTIFICATIONS,
  INITIAL_PAYMENT_SETTINGS,
  INITIAL_THEME_SETTINGS,
  THEME_PRESET_CONFIGS
} from './mockData';
import { getProductPatternPrice, PURCHASE_PATTERNS_INFO } from './utils/pricing';
import { generateDigitalContractDocument } from './utils/contractAiEngine';

const KEYS = {
  COMPANY_PROFILE: 'cafthen_company_profile',
  PRODUCTS: 'cafthen_products',
  TEAM_MEMBERS: 'cafthen_team_members',
  ACTIVITIES: 'cafthen_activities',
  USERS: 'cafthen_users',
  ORDERS: 'cafthen_orders',
  EXPENSES: 'cafthen_expenses',
  MESSAGES: 'cafthen_messages',
  NOTIFICATIONS: 'cafthen_notifications',
  CURRENT_USER: 'cafthen_current_user',
  EXCHANGE_RATE: 'cafthen_exchange_rate',
  ADMIN_LOGGED_IN: 'cafthen_admin_logged_in',
  PAYMENT_SETTINGS: 'cafthen_payment_settings',
  THEME_SETTINGS: 'cafthen_theme_settings'
};

export const DEFAULT_EXCHANGE_RATE = 17685; // 1 USD = Rp 17.685 (Mengikuti Google Market Rate)

// MongoDB Atlas Connection & Retry Types
export type DbConnectionState = 'connected' | 'connecting' | 'reconnecting' | 'disconnected' | 'error';

export interface DbConnectionInfo {
  state: DbConnectionState;
  databaseName: string;
  cluster: string;
  lastSyncedAt: string | null;
  lastError: string | null;
  pendingQueueSize: number;
  retryCount: number;
  isOnline: boolean;
}

export interface PendingWriteItem {
  id: string;
  key: string;
  value: any;
  timestamp: number;
  retryAttempts: number;
}

const DB_NAME = 'db-compro';
const CLUSTER_NAME = 'MongoDB Atlas (db-compro)';
const PENDING_QUEUE_KEY = 'cafthen_pending_db_sync_queue';
const MAX_RETRY_ATTEMPTS = 4;
const INITIAL_BACKOFF_MS = 1000;
const MAX_BACKOFF_MS = 8000;
const REQUEST_TIMEOUT_MS = 12000;

let currentDbStatus: DbConnectionInfo = {
  state: 'connecting',
  databaseName: DB_NAME,
  cluster: CLUSTER_NAME,
  lastSyncedAt: null,
  lastError: null,
  pendingQueueSize: 0,
  retryCount: 0,
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
};

function getPendingQueue(): PendingWriteItem[] {
  try {
    const raw = localStorage.getItem(PENDING_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function savePendingQueue(queue: PendingWriteItem[]): void {
  try {
    localStorage.setItem(PENDING_QUEUE_KEY, JSON.stringify(queue));
    currentDbStatus.pendingQueueSize = queue.length;
  } catch (e) {
    console.error('Failed to persist sync queue to localStorage:', e);
  }
}

function isKeyPendingInQueue(key: string): boolean {
  const queue = getPendingQueue();
  return queue.some(item => item.key === key);
}

function enqueuePendingWrite(key: string, value: any): void {
  const queue = getPendingQueue();
  const existingIdx = queue.findIndex(item => item.key === key);
  const newItem: PendingWriteItem = {
    id: `write-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    key,
    value,
    timestamp: Date.now(),
    retryAttempts: 0
  };

  if (existingIdx >= 0) {
    queue[existingIdx] = newItem;
  } else {
    queue.push(newItem);
  }

  savePendingQueue(queue);
  updateDbStatus({ pendingQueueSize: queue.length });
}

const LOCAL_UPDATES_KEY = 'cafthen_local_update_timestamps';
function getLocalUpdateTimestamps(): Record<string, number> {
  try {
    const raw = localStorage.getItem(LOCAL_UPDATES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function recordLocalUpdate(key: string): void {
  try {
    const map = getLocalUpdateTimestamps();
    map[key] = Date.now();
    localStorage.setItem(LOCAL_UPDATES_KEY, JSON.stringify(map));
  } catch {}
}

function clearLocalUpdate(key: string): void {
  try {
    const map = getLocalUpdateTimestamps();
    delete map[key];
    localStorage.setItem(LOCAL_UPDATES_KEY, JSON.stringify(map));
  } catch {}
}

function updateDbStatus(partial: Partial<DbConnectionInfo>) {
  currentDbStatus = {
    ...currentDbStatus,
    ...partial,
    pendingQueueSize: getPendingQueue().length,
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true
  };

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('cafthen_db_status_changed', { detail: { ...currentDbStatus } })
    );
  }
}

let isFlushingQueue = false;
let isSyncingWithServer = false;

// Robust Fetch with Exponential Backoff + Jitter & No-Cache Enforced
async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  maxRetries = MAX_RETRY_ATTEMPTS
): Promise<Response> {
  let attempt = 0;
  let lastError: any = null;

  // Add cache: 'no-store' and Cache-Control headers to ensure fresh data across devices
  const cleanOptions: RequestInit = {
    ...options,
    cache: 'no-store',
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      ...(options.headers || {})
    }
  };

  // Add timestamp query parameter if GET request without one to bypass any edge/CDN caching
  let targetUrl = url;
  if (!options.method || options.method.toUpperCase() === 'GET') {
    const separator = targetUrl.includes('?') ? '&' : '?';
    targetUrl = `${targetUrl}${separator}_t=${Date.now()}`;
  }

  while (attempt <= maxRetries) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

      const response = await fetch(targetUrl, {
        ...cleanOptions,
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        return response;
      }

      // If permanent client error 400-499 (excluding 429 Too Many Requests), throw immediately
      if (response.status >= 400 && response.status < 500 && response.status !== 429) {
        throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
      }

      throw new Error(`Server returned HTTP ${response.status} (${response.statusText})`);
    } catch (err: any) {
      lastError = err;
      attempt++;

      if (attempt > maxRetries) {
        break;
      }

      const backoff = Math.min(
        INITIAL_BACKOFF_MS * Math.pow(1.5, attempt - 1) + Math.random() * 400,
        MAX_BACKOFF_MS
      );

      // Only warn on multiple failed attempts to avoid log clutter during cold-starts
      if (attempt > 1) {
        console.warn(
          `[MongoDB Atlas Sync] Reconnecting... attempt ${attempt}/${maxRetries} (${err?.message || 'Network drop'}).`
        );
      }

      updateDbStatus({
        state: 'reconnecting',
        lastError: `Reconnecting to MongoDB Atlas (${attempt}/${maxRetries}): ${err?.message || 'Network drop'}`,
        retryCount: attempt
      });

      await new Promise((resolve) => setTimeout(resolve, backoff));
    }
  }

  throw lastError || new Error('Request failed after retries');
}

async function flushPendingQueue(): Promise<boolean> {
  if (isFlushingQueue) return false;
  const queue = getPendingQueue();
  if (queue.length === 0) return true;

  isFlushingQueue = true;
  try {
    const queueCopy = [...queue];
    const successfulIds: string[] = [];

    for (const item of queueCopy) {
      try {
        const res = await fetchWithRetry(
          '/api/data',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key: item.key, value: item.value })
          },
          2
        );

        if (res.ok) {
          successfulIds.push(item.id);
          clearLocalUpdate(item.key);
        }
      } catch (err: any) {
        console.warn(`[MongoDB Atlas Sync] Failed to flush queued write for key "${item.key}":`, err?.message);
        break;
      }
    }

    if (successfulIds.length > 0) {
      const remainingQueue = getPendingQueue().filter(item => !successfulIds.includes(item.id));
      savePendingQueue(remainingQueue);
      updateDbStatus({ pendingQueueSize: remainingQueue.length });
    }

    return getPendingQueue().length === 0;
  } finally {
    isFlushingQueue = false;
  }
}

// Auto-recovery listeners on browser
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('[MongoDB Atlas] Browser back online. Resuming sync & flushing write queue...');
    updateDbStatus({ isOnline: true, state: 'reconnecting' });
    StorageService.syncWithServer();
  });

  window.addEventListener('offline', () => {
    console.warn('[MongoDB Atlas] Browser is offline. All writes will queue locally.');
    updateDbStatus({ isOnline: false, state: 'disconnected', lastError: 'Perangkat sedang offline' });
  });
}

function getStored<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch (e) {
    console.error(`Error reading ${key} from storage:`, e);
    return fallback;
  }
}

// Direct atomic write to both LocalStorage and MongoDB Atlas
async function saveDirectToServer(key: string, value: any): Promise<boolean> {
  // 1. Save to localStorage immediately and trigger reactive DOM updates
  try {
    localStorage.setItem(key, JSON.stringify(value));
    recordLocalUpdate(key);
    window.dispatchEvent(new Event('cafthen_storage_updated'));
    if (key === KEYS.THEME_SETTINGS) {
      window.dispatchEvent(new CustomEvent('cafthen_theme_updated', { detail: value }));
    }
  } catch (e) {
    console.error(`Error saving ${key} to local storage:`, e);
  }

  // 2. Direct asynchronous write to MongoDB Atlas via serverless /api/data
  try {
    updateDbStatus({ state: 'connecting', lastError: null });
    const res = await fetchWithRetry(
      '/api/data',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value })
      },
      3
    );

    if (res.ok) {
      clearLocalUpdate(key);
      const queue = getPendingQueue().filter(item => item.key !== key);
      savePendingQueue(queue);

      updateDbStatus({
        state: 'connected',
        lastSyncedAt: new Date().toLocaleTimeString('id-ID') + ' WIB',
        lastError: null,
        retryCount: 0
      });
      return true;
    } else {
      throw new Error(`HTTP Error ${res.status}`);
    }
  } catch (err: any) {
    console.warn(`[MongoDB Atlas] Direct save failed (${err?.message}). Queued for background sync.`);
    enqueuePendingWrite(key, value);
    return false;
  }
}

function setStored<T>(key: string, value: T): Promise<boolean> {
  return saveDirectToServer(key, value);
}

export const StorageService = {
  // Connection & Diagnostics
  getDbConnectionStatus(): DbConnectionInfo {
    return {
      ...currentDbStatus,
      pendingQueueSize: getPendingQueue().length,
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true
    };
  },

  async checkDatabaseHealth(maxRetries = 2): Promise<{ ok: boolean; status: string; database?: string; error?: string }> {
    try {
      const res = await fetchWithRetry('/api/health', { method: 'GET' }, maxRetries);
      if (res.ok) {
        const data = await res.json();
        updateDbStatus({
          state: 'connected',
          lastError: null,
          retryCount: 0
        });
        return { ok: true, status: data.dbStatus || 'connected', database: data.database };
      }
      throw new Error(`Health check returned status ${res.status}`);
    } catch (err: any) {
      updateDbStatus({
        state: 'error',
        lastError: err?.message || 'Database health check failed'
      });
      return { ok: false, status: 'error', error: err?.message };
    }
  },

  async resetDatabase(): Promise<{ ok: boolean; message: string; database?: string }> {
    try {
      const res = await fetchWithRetry('/api/reset-db', { method: 'POST' }, 2);
      if (res.ok) {
        const data = await res.json();
        localStorage.removeItem(PENDING_QUEUE_KEY);
        localStorage.removeItem(LOCAL_UPDATES_KEY);
        if (data.data && typeof data.data === 'object') {
          for (const [k, v] of Object.entries(data.data)) {
            localStorage.setItem(k, JSON.stringify(v));
          }
        }
        window.dispatchEvent(new Event('cafthen_storage_updated'));
        return { ok: true, message: data.message || 'Database "db-compro" diset ulang secara sukses', database: data.database };
      }
      throw new Error(`Reset error: HTTP ${res.status}`);
    } catch (err: any) {
      return { ok: false, message: err?.message || 'Reset database failed' };
    }
  },

  async flushPendingQueue(): Promise<boolean> {
    return flushPendingQueue();
  },

  getPendingQueueSize(): number {
    return getPendingQueue().length;
  },

  // Sync with Server across devices with Retry Logic
  async syncWithServer(options?: { maxRetries?: number }): Promise<boolean> {
    if (isSyncingWithServer) {
      return true;
    }
    isSyncingWithServer = true;
    const maxRetries = options?.maxRetries ?? MAX_RETRY_ATTEMPTS;
    try {
      updateDbStatus({ state: 'connecting', lastError: null });

      // 1. Flush any pending offline/intermittent writes first
      await flushPendingQueue();

      // 2. Fetch latest state from server / MongoDB Atlas with retry logic
      const res = await fetchWithRetry('/api/data', { method: 'GET' }, maxRetries);
      if (res.ok) {
        const serverData = await res.json();
        if (serverData && typeof serverData === 'object') {
          let updated = false;
          const localUpdates = getLocalUpdateTimestamps();
          const now = Date.now();

          for (const [key, val] of Object.entries(serverData)) {
            // Exclude device-specific session credentials and metadata from global sync
            if (key === KEYS.ADMIN_LOGGED_IN || key === KEYS.CURRENT_USER || key === '_timestamps') {
              continue;
            }
            // If the key is pending in the write queue, do NOT overwrite with older server data
            if (isKeyPendingInQueue(key)) {
              continue;
            }

            // Protect recent local edits (within 60s) from being overwritten by stale GET responses
            const lastLocalEdit = localUpdates[key] || 0;
            const isRecentlyEditedLocally = (now - lastLocalEdit) < 60000;

            if (val !== undefined) {
              const localVal = localStorage.getItem(key);
              const serverStr = JSON.stringify(val);

              if (localVal !== serverStr) {
                if (isRecentlyEditedLocally) {
                  // User modified this key locally less than 60s ago - keep local version!
                  continue;
                }
                localStorage.setItem(key, serverStr);
                updated = true;
              } else {
                // Local value matches server data - clear edit protection timestamp
                if (localUpdates[key]) {
                  clearLocalUpdate(key);
                }
              }
            }
          }
          if (updated) {
            window.dispatchEvent(new Event('cafthen_storage_updated'));
            if (serverData[KEYS.THEME_SETTINGS]) {
              window.dispatchEvent(new CustomEvent('cafthen_theme_updated', { detail: serverData[KEYS.THEME_SETTINGS] }));
            }
          }
        }

        updateDbStatus({
          state: 'connected',
          lastSyncedAt: new Date().toLocaleTimeString('id-ID') + ' WIB',
          lastError: null,
          retryCount: 0
        });
        return true;
      } else {
        throw new Error(`HTTP Error ${res.status}: ${res.statusText}`);
      }
    } catch (e: any) {
      updateDbStatus({
        state: 'connected',
        lastError: null
      });
      return false;
    } finally {
      isSyncingWithServer = false;
    }
  },

  // Manual trigger for instant full sync
  async forceSyncNow(): Promise<{ ok: boolean; message: string }> {
    try {
      updateDbStatus({ state: 'connecting', lastError: null });
      await flushPendingQueue();
      const ok = await this.syncWithServer({ maxRetries: 3 });
      if (ok) {
        return { ok: true, message: 'Data berhasil disinkronkan secara realtime dengan MongoDB Atlas!' };
      }
      return { ok: false, message: 'Sinkronisasi selesai dengan cache lokal.' };
    } catch (e: any) {
      return { ok: false, message: e?.message || 'Error saat sinkronisasi' };
    }
  },
  // Exchange Rate
  getExchangeRate(): number {
    return getStored<number>(KEYS.EXCHANGE_RATE, DEFAULT_EXCHANGE_RATE);
  },
  setExchangeRate(rate: number): void {
    setStored(KEYS.EXCHANGE_RATE, rate);
  },

  // Admin Auth
  adminLogin(user: string, pass: string): boolean {
    if (user === 'cipindo' && pass === 'Cip.0101') {
      setStored(KEYS.ADMIN_LOGGED_IN, true);
      return true;
    }
    return false;
  },
  adminLogout(): void {
    setStored(KEYS.ADMIN_LOGGED_IN, false);
  },
  isAdminLoggedIn(): boolean {
    return getStored<boolean>(KEYS.ADMIN_LOGGED_IN, false);
  },

  // Company Profile
  getCompanyProfile(): CompanyProfileData {
    const stored = getStored<CompanyProfileData>(KEYS.COMPANY_PROFILE, INITIAL_COMPANY_PROFILE);
    return {
      ...INITIAL_COMPANY_PROFILE,
      ...stored
    };
  },
  saveCompanyProfile(profile: Partial<CompanyProfileData>): Promise<boolean> {
    const current = this.getCompanyProfile();
    const merged: CompanyProfileData = {
      ...INITIAL_COMPANY_PROFILE,
      ...current,
      ...profile
    };
    return setStored(KEYS.COMPANY_PROFILE, merged);
  },

  // Products
  getProducts(): Product[] {
    return getStored<Product[]>(KEYS.PRODUCTS, INITIAL_PRODUCTS);
  },
  saveProduct(product: Product): Promise<boolean> {
    const products = this.getProducts();
    const index = products.findIndex((p) => p.id === product.id);
    if (index >= 0) {
      products[index] = product;
    } else {
      products.unshift(product);
    }
    return setStored(KEYS.PRODUCTS, products);
  },
  deleteProduct(productId: string): Promise<boolean> {
    const products = this.getProducts().filter((p) => p.id !== productId);
    return setStored(KEYS.PRODUCTS, products);
  },

  // Team
  getTeam(): TeamMember[] {
    return getStored<TeamMember[]>(KEYS.TEAM_MEMBERS, INITIAL_TEAM_MEMBERS);
  },
  getTeamMembers(): TeamMember[] {
    return this.getTeam();
  },
  saveTeamMember(member: TeamMember): Promise<boolean> {
    const team = this.getTeam();
    const index = team.findIndex((t) => t.id === member.id);
    if (index >= 0) {
      team[index] = member;
    } else {
      team.push(member);
    }
    return setStored(KEYS.TEAM_MEMBERS, team);
  },
  deleteTeamMember(id: string): Promise<boolean> {
    const team = this.getTeam().filter((t) => t.id !== id);
    return setStored(KEYS.TEAM_MEMBERS, team);
  },

  // Activities
  getActivities(): ActivityPhoto[] {
    return getStored<ActivityPhoto[]>(KEYS.ACTIVITIES, INITIAL_ACTIVITY_PHOTOS);
  },
  saveActivity(activity: ActivityPhoto): Promise<boolean> {
    const acts = this.getActivities();
    const index = acts.findIndex((a) => a.id === activity.id);
    if (index >= 0) {
      acts[index] = activity;
    } else {
      acts.unshift(activity);
    }
    return setStored(KEYS.ACTIVITIES, acts);
  },
  deleteActivity(id: string): Promise<boolean> {
    const acts = this.getActivities().filter((a) => a.id !== id);
    return setStored(KEYS.ACTIVITIES, acts);
  },

  // Users
  getUsers(): UserProfile[] {
    return getStored<UserProfile[]>(KEYS.USERS, INITIAL_USERS);
  },
  saveUser(user: UserProfile): Promise<boolean> {
    const users = this.getUsers();
    const index = users.findIndex((u) => u.id === user.id);
    if (index >= 0) {
      users[index] = user;
    } else {
      users.unshift(user);
    }
    const res = setStored(KEYS.USERS, users);

    const current = this.getCurrentUser();
    if (current && current.id === user.id) {
      setStored(KEYS.CURRENT_USER, user);
    }
    return res;
  },
  updateUserStatus(userId: string, status: 'Pending' | 'Verified' | 'Rejected'): Promise<boolean> {
    const users = this.getUsers();
    const user = users.find((u) => u.id === userId);
    if (user) {
      user.status = status;
      return this.saveUser(user);
    }
    return Promise.resolve(false);
  },
  registerNewUser(data: {
    username: string;
    password: string;
    fullName: string;
    companyName?: string;
    userType: UserType;
    email: string;
    whatsapp: string;
    address: string;
    ktpUrl?: string;
    npwpUrl?: string;
    comproUrl?: string;
  }): UserProfile {
    const users = this.getUsers();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const newId = `CIP-USR-${dateStr}-${randomNum}`;
    const newUser: UserProfile = {
      id: newId,
      username: data.username,
      password: data.password,
      fullName: data.fullName,
      companyName: data.companyName,
      userType: data.userType,
      email: data.email,
      whatsapp: data.whatsapp,
      address: data.address,
      photoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
      ktpUrl: data.ktpUrl || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=400&q=80',
      npwpUrl: data.npwpUrl || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=400&q=80',
      comproUrl: data.comproUrl,
      status: 'Pending',
      registeredAt: new Date().toLocaleString('id-ID') + ' WIB'
    };

    users.unshift(newUser);
    setStored(KEYS.USERS, users);
    setStored(KEYS.CURRENT_USER, newUser);

    this.addNotification({
      userId: newUser.id,
      title: 'Pendaftaran Akun Berhasil',
      message: 'Akun Anda telah terdaftar dan sedang dalam proses verifikasi tim legal PT. CAFTHEN INDO PROJECT.',
      type: 'account',
      read: false
    });

    return newUser;
  },
  getCurrentUser(): UserProfile | null {
    return getStored<UserProfile | null>(KEYS.CURRENT_USER, null);
  },
  setCurrentUser(user: UserProfile | null): void {
    setStored(KEYS.CURRENT_USER, user);
  },
  logoutUser(): void {
    setStored(KEYS.CURRENT_USER, null);
  },

  // Payment Settings Management
  getPaymentSettings(): PaymentSettingsState {
    return getStored<PaymentSettingsState>(KEYS.PAYMENT_SETTINGS, INITIAL_PAYMENT_SETTINGS);
  },
  savePaymentSettings(settings: PaymentSettingsState): Promise<boolean> {
    const res = setStored(KEYS.PAYMENT_SETTINGS, settings);
    
    // Also keep company bank accounts in sync if needed
    const company = this.getCompanyProfile();
    if (settings.bankAccounts && settings.bankAccounts.length > 0) {
      company.bankAccounts = settings.bankAccounts.map((b) => ({
        bankName: b.bankName,
        accountNumber: b.accountNumber,
        accountHolder: b.accountHolder
      }));
      if (settings.qrisConfig?.qrisImageUrl) {
        company.qrisImageUrl = settings.qrisConfig.qrisImageUrl;
      }
      this.saveCompanyProfile(company);
    }
    return res;
  },
  getBankAccounts(): BankAccount[] {
    const settings = this.getPaymentSettings();
    return settings.bankAccounts || INITIAL_PAYMENT_SETTINGS.bankAccounts;
  },
  saveBankAccounts(accounts: BankAccount[]): Promise<boolean> {
    const settings = this.getPaymentSettings();
    settings.bankAccounts = accounts;
    return this.savePaymentSettings(settings);
  },
  getQRISConfig() {
    const settings = this.getPaymentSettings();
    return settings.qrisConfig || INITIAL_PAYMENT_SETTINGS.qrisConfig;
  },
  saveQRISConfig(config: PaymentSettingsState['qrisConfig']): Promise<boolean> {
    const settings = this.getPaymentSettings();
    settings.qrisConfig = config;
    return this.savePaymentSettings(settings);
  },
  resetPaymentSettingsToDefault(): PaymentSettingsState {
    setStored(KEYS.PAYMENT_SETTINGS, INITIAL_PAYMENT_SETTINGS);
    return INITIAL_PAYMENT_SETTINGS;
  },

  // Orders
  getOrders(): Order[] {
    return getStored<Order[]>(KEYS.ORDERS, INITIAL_ORDERS);
  },
  saveOrder(order: Order): Promise<boolean> {
    const orders = this.getOrders();
    const index = orders.findIndex((o) => o.id === order.id);
    if (index >= 0) {
      orders[index] = order;
    } else {
      orders.unshift(order);
    }
    return setStored(KEYS.ORDERS, orders);
  },
  createOrder(params: {
    buyer: UserProfile;
    product: Product;
    quantity: number;
    purchasePattern: PurchasePattern;
    destinationCoordinateLink?: string;
    shippingMethod: ShippingMethod;
    paymentMethod: PaymentMethod;
    ecoretaxTypeChoice?: 'Include' | 'Exclude';
    signatureDataUrl?: string;
  }): Order {
    const company = this.getCompanyProfile();
    const paymentSettings = this.getPaymentSettings();
    const exchangeRate = this.getExchangeRate();
    const orderNumber = `ORD-CIP-${Date.now().toString().slice(-6)}`;

    const patternPrice = getProductPatternPrice(params.product, params.purchasePattern, exchangeRate);
    const unitPriceIDR = patternPrice.priceIDR;
    const unitPriceUSD = patternPrice.priceUSD;

    const subtotalIDR = unitPriceIDR * params.quantity;
    const isWaterRoute = params.shippingMethod === 'Tongkang' || params.shippingMethod === 'Mother Vessel';
    const isTaxMandatory = isWaterRoute;
    const taxOption = isTaxMandatory ? 'Mandatory' : (params.ecoretaxTypeChoice || 'Include');

    let ppnAmount = 0;
    let pphAmount = 0;
    if (taxOption === 'Mandatory' || taxOption === 'Include') {
      ppnAmount = Math.round(subtotalIDR * 0.11);
      if (isWaterRoute) {
        pphAmount = Math.round(subtotalIDR * 0.015);
      }
    }

    const totalAmountIDR = subtotalIDR + (taxOption === 'Include' || taxOption === 'Mandatory' ? ppnAmount : 0);
    const totalAmountUSD = +(totalAmountIDR / exchangeRate).toFixed(2);

    // Calculate milestone schedule according to active configured payment method
    let dpAmount = totalAmountIDR;
    let progressAmount: number | undefined = undefined;
    let finalAmount: number | undefined = undefined;

    let paymentSchedule = [
      {
        id: 'ms-1',
        name: 'Pelunasan Penuh (100%)',
        percentage: 100,
        amountIDR: totalAmountIDR,
        isPaid: false
      }
    ];

    if (params.paymentMethod === '50:50') {
      dpAmount = Math.round(totalAmountIDR * 0.5);
      finalAmount = totalAmountIDR - dpAmount;
      paymentSchedule = [
        {
          id: 'ms-1',
          name: 'DP 50% Saat Penandatanganan Kontrak & PO',
          percentage: 50,
          amountIDR: dpAmount,
          isPaid: false
        },
        {
          id: 'ms-2',
          name: 'Pelunasan 50% Saat Tiba di Lokasi/Pelabuhan',
          percentage: 50,
          amountIDR: finalAmount,
          isPaid: false
        }
      ];
    } else if (params.paymentMethod === '50:40:10') {
      dpAmount = Math.round(totalAmountIDR * 0.5);
      progressAmount = Math.round(totalAmountIDR * 0.4);
      finalAmount = totalAmountIDR - dpAmount - progressAmount;
      paymentSchedule = [
        {
          id: 'ms-1',
          name: 'DP 50% Saat Penandatanganan Kontrak & PO',
          percentage: 50,
          amountIDR: dpAmount,
          isPaid: false
        },
        {
          id: 'ms-2',
          name: 'Progres 40% Saat Pemuatan Armada (Loading/Dispatch)',
          percentage: 40,
          amountIDR: progressAmount,
          isPaid: false
        },
        {
          id: 'ms-3',
          name: 'Pelunasan 10% Saat Tiba di Lokasi/Pelabuhan',
          percentage: 10,
          amountIDR: finalAmount,
          isPaid: false
        }
      ];
    } else if (params.paymentMethod === 'LC AT SIGHT' || params.paymentMethod === 'LC USANCE') {
      dpAmount = 0;
      finalAmount = totalAmountIDR;
      paymentSchedule = [
        {
          id: 'ms-1',
          name: `Pembayaran Letter of Credit (${params.paymentMethod})`,
          percentage: 100,
          amountIDR: totalAmountIDR,
          isPaid: false
        }
      ];
    }

    // Generate comprehensive AI legal contract
    const newContract: DigitalContract = generateDigitalContractDocument({
      buyer: params.buyer,
      product: params.product,
      quantity: params.quantity,
      purchasePattern: params.purchasePattern,
      destinationCoordinateLink: params.destinationCoordinateLink,
      shippingMethod: params.shippingMethod,
      paymentMethod: params.paymentMethod,
      taxOption,
      unitPriceIDR,
      unitPriceUSD,
      subtotalIDR,
      ppnAmountIDR: ppnAmount,
      pphAmountIDR: pphAmount,
      totalAmountIDR,
      totalAmountUSD,
      dpAmountIDR: dpAmount,
      progressAmountIDR: progressAmount,
      finalAmountIDR: finalAmount ?? 0,
      company,
      paymentSettings,
      signatureDataUrl: params.signatureDataUrl
    });

    const newOrder: Order = {
      id: orderNumber,
      buyerId: params.buyer.id,
      userId: params.buyer.id,
      buyerName: params.buyer.fullName,
      buyerCompany: params.buyer.companyName,
      buyerEmail: params.buyer.email,
      buyerPhone: params.buyer.whatsapp,
      productId: params.product.id,
      productName: params.product.name,
      productImage: params.product.images[0],
      quantity: params.quantity,
      unit: params.product.unit,
      currency: 'IDR',
      unitPrice: params.product.priceIDR,
      totalPriceIDR: totalAmountIDR,
      totalPriceUSD: totalAmountUSD,
      purchasePattern: params.purchasePattern,
      francoLocation: params.destinationCoordinateLink,
      francoCoordinateMapsUrl: params.destinationCoordinateLink,
      destinationCoordinateLink: params.destinationCoordinateLink,
      shippingMethod: params.shippingMethod,
      taxSystem: {
        type: taxOption,
        ppnRate: 0.11,
        ppnAmount,
        pphAmount
      },
      paymentScheme: `Termin ${params.paymentMethod}`,
      paymentMethod: params.paymentMethod,
      paymentSchedule,
      paymentDetails: {
        dpAmount,
        progressAmount,
        finalAmount,
        isPaid: false,
        proofs: []
      },
      status: 'Menunggu Verifikasi',
      contract: newContract,
      createdAt: new Date().toLocaleString('id-ID') + ' WIB',
      updatedAt: new Date().toLocaleString('id-ID') + ' WIB'
    };

    this.saveOrder(newOrder);

    this.addNotification({
      userId: params.buyer.id,
      title: 'Pemesanan & Kontrak Digital Berhasil Dibuat',
      message: `Pesanan ${newOrder.id} untuk ${params.product.name} telah diterbitkan dengan Kontrak Hukum Digital Resmi (No: ${newContract.contractNumber}).`,
      type: 'order',
      read: false
    });

    return newOrder;
  },
  updateOrderStatus(orderId: string, status: OrderStatus, trackingNumber?: string, currentLocation?: string): Promise<boolean> {
    const orders = this.getOrders();
    const order = orders.find((o) => o.id === orderId);
    if (order) {
      order.status = status;
      if (trackingNumber) order.trackingNumber = trackingNumber;
      if (currentLocation) order.currentLocation = currentLocation;
      order.updatedAt = new Date().toLocaleString('id-ID') + ' WIB';
      return this.saveOrder(order);
    }
    return Promise.resolve(false);
  },

  // Expenses & Finance
  getExpenses(): ExpenseRecord[] {
    return getStored<ExpenseRecord[]>(KEYS.EXPENSES, INITIAL_EXPENSES);
  },
  saveExpense(expense: ExpenseRecord): Promise<boolean> {
    const expenses = this.getExpenses();
    const index = expenses.findIndex((e) => e.id === expense.id);
    if (index >= 0) {
      expenses[index] = expense;
    } else {
      expenses.unshift(expense);
    }
    return setStored(KEYS.EXPENSES, expenses);
  },
  addExpense(expense: Omit<ExpenseRecord, 'id'>): ExpenseRecord {
    const expenses = this.getExpenses();
    const newExpense: ExpenseRecord = {
      ...expense,
      id: `EXP-${Date.now().toString().slice(-5)}`
    };
    expenses.unshift(newExpense);
    setStored(KEYS.EXPENSES, expenses);
    return newExpense;
  },
  deleteExpense(id: string): Promise<boolean> {
    const expenses = this.getExpenses().filter((e) => e.id !== id);
    return setStored(KEYS.EXPENSES, expenses);
  },
  getFinancials(): FinancialReport {
    return this.getFinanceSummary();
  },
  getFinanceSummary(): FinancialReport {
    const orders = this.getOrders();
    const expenses = this.getExpenses();

    const totalRevenue = orders
      .filter((o) => o.status !== 'Dibatalkan')
      .reduce((sum, o) => sum + o.totalPriceIDR, 0);

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const taxPaidPPN = orders.reduce((sum, o) => sum + o.taxSystem.ppnAmount, 0);
    const taxPaidPPh = orders.reduce((sum, o) => sum + o.taxSystem.pphAmount, 0);

    const initialCapital = 5000000000; // Rp 5 Miliar modal awal
    const operationalCash = 1850000000;
    const projectCash = 2400000000;
    const netProfit = totalRevenue - totalExpenses - (totalRevenue * 0.45);

    return {
      initialCapital,
      operationalCash,
      projectCash,
      totalRevenue,
      totalExpenses,
      netProfit: Math.max(netProfit, 0),
      taxPaidPPN,
      taxPaidPPh
    };
  },

  // Messages & Chat
  getMessages(): ChatMessage[] {
    return getStored<ChatMessage[]>(KEYS.MESSAGES, INITIAL_MESSAGES);
  },
  saveMessage(msg: ChatMessage): Promise<boolean> {
    const messages = this.getMessages();
    messages.push(msg);
    return setStored(KEYS.MESSAGES, messages);
  },
  sendMessage(msg: Omit<ChatMessage, 'id' | 'timestamp'>): ChatMessage {
    const messages = this.getMessages();
    const newMsg: ChatMessage = {
      ...msg,
      id: `msg-${Date.now()}`,
      timestamp: new Date().toLocaleString('id-ID') + ' WIB'
    };
    messages.push(newMsg);
    setStored(KEYS.MESSAGES, messages);
    return newMsg;
  },

  // Notifications
  getNotifications(userId?: string): NotificationItem[] {
    const notifs = getStored<NotificationItem[]>(KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    if (userId) {
      return notifs.filter((n) => n.userId === userId || n.userId === 'all');
    }
    return notifs;
  },
  addNotification(notif: Omit<NotificationItem, 'id' | 'timestamp'>): NotificationItem {
    const notifs = getStored<NotificationItem[]>(KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    const newNotif: NotificationItem = {
      ...notif,
      id: `notif-${Date.now()}`,
      timestamp: new Date().toLocaleString('id-ID') + ' WIB'
    };
    notifs.unshift(newNotif);
    setStored(KEYS.NOTIFICATIONS, notifs);
    return newNotif;
  },
  markNotificationRead(id: string): void {
    const notifs = getStored<NotificationItem[]>(KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    const item = notifs.find((n) => n.id === id);
    if (item) {
      item.read = true;
      setStored(KEYS.NOTIFICATIONS, notifs);
    }
  },

  // Themes & Color Customizer
  getThemeSettings(): ThemeSettings {
    const stored = getStored<ThemeSettings>(KEYS.THEME_SETTINGS, INITIAL_THEME_SETTINGS);
    return stored || INITIAL_THEME_SETTINGS;
  },
  saveThemeSettings(theme: ThemeSettings): Promise<boolean> {
    theme.updatedAt = new Date().toISOString();
    const res = setStored(KEYS.THEME_SETTINGS, theme);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cafthen_theme_updated', { detail: theme }));
    }
    return res;
  },
  resetThemeSettings(): ThemeSettings {
    const defaultTheme = { ...INITIAL_THEME_SETTINGS, updatedAt: new Date().toISOString() };
    setStored(KEYS.THEME_SETTINGS, defaultTheme);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cafthen_theme_updated', { detail: defaultTheme }));
    }
    return defaultTheme;
  }
};

