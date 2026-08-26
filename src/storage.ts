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
  BankAccount
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
  INITIAL_PAYMENT_SETTINGS
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
  PAYMENT_SETTINGS: 'cafthen_payment_settings'
};

export const DEFAULT_EXCHANGE_RATE = 17685; // 1 USD = Rp 17.685 (Mengikuti Google Market Rate)

function getStored<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch (e) {
    console.error(`Error reading ${key} from storage:`, e);
    return fallback;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new Event('cafthen_storage_updated'));

    // Push update to backend server for cross-device persistence if available
    fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value })
    }).catch(() => {
      // Server sync optional - gracefully fallback to local storage
    });
  } catch (e) {
    console.error(`Error saving ${key} to storage:`, e);
  }
}

export const StorageService = {
  // Sync with Server across devices
  async syncWithServer(): Promise<void> {
    try {
      const res = await fetch('/api/data');
      if (res.ok) {
        const serverData = await res.json();
        if (serverData && typeof serverData === 'object') {
          let updated = false;
          for (const [key, val] of Object.entries(serverData)) {
            if (val !== undefined) {
              const localVal = localStorage.getItem(key);
              const serverStr = JSON.stringify(val);
              if (localVal !== serverStr) {
                localStorage.setItem(key, serverStr);
                updated = true;
              }
            }
          }
          if (updated) {
            window.dispatchEvent(new Event('cafthen_storage_updated'));
          }
        }
      }
    } catch (e) {
      // Server sync optional - gracefully fallback to local storage
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
    return getStored<CompanyProfileData>(KEYS.COMPANY_PROFILE, INITIAL_COMPANY_PROFILE);
  },
  saveCompanyProfile(profile: CompanyProfileData): void {
    setStored(KEYS.COMPANY_PROFILE, profile);
  },

  // Products
  getProducts(): Product[] {
    return getStored<Product[]>(KEYS.PRODUCTS, INITIAL_PRODUCTS);
  },
  saveProduct(product: Product): void {
    const products = this.getProducts();
    const index = products.findIndex((p) => p.id === product.id);
    if (index >= 0) {
      products[index] = product;
    } else {
      products.unshift(product);
    }
    setStored(KEYS.PRODUCTS, products);
  },
  deleteProduct(productId: string): void {
    const products = this.getProducts().filter((p) => p.id !== productId);
    setStored(KEYS.PRODUCTS, products);
  },

  // Team
  getTeam(): TeamMember[] {
    return getStored<TeamMember[]>(KEYS.TEAM_MEMBERS, INITIAL_TEAM_MEMBERS);
  },
  getTeamMembers(): TeamMember[] {
    return this.getTeam();
  },
  saveTeamMember(member: TeamMember): void {
    const team = this.getTeam();
    const index = team.findIndex((t) => t.id === member.id);
    if (index >= 0) {
      team[index] = member;
    } else {
      team.push(member);
    }
    setStored(KEYS.TEAM_MEMBERS, team);
  },
  deleteTeamMember(id: string): void {
    const team = this.getTeam().filter((t) => t.id !== id);
    setStored(KEYS.TEAM_MEMBERS, team);
  },

  // Activities
  getActivities(): ActivityPhoto[] {
    return getStored<ActivityPhoto[]>(KEYS.ACTIVITIES, INITIAL_ACTIVITY_PHOTOS);
  },
  saveActivity(activity: ActivityPhoto): void {
    const acts = this.getActivities();
    const index = acts.findIndex((a) => a.id === activity.id);
    if (index >= 0) {
      acts[index] = activity;
    } else {
      acts.unshift(activity);
    }
    setStored(KEYS.ACTIVITIES, acts);
  },
  deleteActivity(id: string): void {
    const acts = this.getActivities().filter((a) => a.id !== id);
    setStored(KEYS.ACTIVITIES, acts);
  },

  // Users
  getUsers(): UserProfile[] {
    return getStored<UserProfile[]>(KEYS.USERS, INITIAL_USERS);
  },
  saveUser(user: UserProfile): void {
    const users = this.getUsers();
    const index = users.findIndex((u) => u.id === user.id);
    if (index >= 0) {
      users[index] = user;
    } else {
      users.unshift(user);
    }
    setStored(KEYS.USERS, users);

    const current = this.getCurrentUser();
    if (current && current.id === user.id) {
      setStored(KEYS.CURRENT_USER, user);
    }
  },
  updateUserStatus(userId: string, status: 'Pending' | 'Verified' | 'Rejected'): void {
    const users = this.getUsers();
    const user = users.find((u) => u.id === userId);
    if (user) {
      user.status = status;
      this.saveUser(user);
    }
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
  savePaymentSettings(settings: PaymentSettingsState): void {
    setStored(KEYS.PAYMENT_SETTINGS, settings);
    
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
  },
  getBankAccounts(): BankAccount[] {
    const settings = this.getPaymentSettings();
    return settings.bankAccounts || INITIAL_PAYMENT_SETTINGS.bankAccounts;
  },
  saveBankAccounts(accounts: BankAccount[]): void {
    const settings = this.getPaymentSettings();
    settings.bankAccounts = accounts;
    this.savePaymentSettings(settings);
  },
  getQRISConfig() {
    const settings = this.getPaymentSettings();
    return settings.qrisConfig || INITIAL_PAYMENT_SETTINGS.qrisConfig;
  },
  saveQRISConfig(config: PaymentSettingsState['qrisConfig']): void {
    const settings = this.getPaymentSettings();
    settings.qrisConfig = config;
    this.savePaymentSettings(settings);
  },
  resetPaymentSettingsToDefault(): PaymentSettingsState {
    setStored(KEYS.PAYMENT_SETTINGS, INITIAL_PAYMENT_SETTINGS);
    return INITIAL_PAYMENT_SETTINGS;
  },

  // Orders
  getOrders(): Order[] {
    return getStored<Order[]>(KEYS.ORDERS, INITIAL_ORDERS);
  },
  saveOrder(order: Order): void {
    const orders = this.getOrders();
    const index = orders.findIndex((o) => o.id === order.id);
    if (index >= 0) {
      orders[index] = order;
    } else {
      orders.unshift(order);
    }
    setStored(KEYS.ORDERS, orders);
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
  updateOrderStatus(orderId: string, status: OrderStatus, trackingNumber?: string, currentLocation?: string): void {
    const orders = this.getOrders();
    const order = orders.find((o) => o.id === orderId);
    if (order) {
      order.status = status;
      if (trackingNumber) order.trackingNumber = trackingNumber;
      if (currentLocation) order.currentLocation = currentLocation;
      order.updatedAt = new Date().toLocaleString('id-ID') + ' WIB';
      this.saveOrder(order);
    }
  },

  // Expenses & Finance
  getExpenses(): ExpenseRecord[] {
    return getStored<ExpenseRecord[]>(KEYS.EXPENSES, INITIAL_EXPENSES);
  },
  saveExpense(expense: ExpenseRecord): void {
    const expenses = this.getExpenses();
    const index = expenses.findIndex((e) => e.id === expense.id);
    if (index >= 0) {
      expenses[index] = expense;
    } else {
      expenses.unshift(expense);
    }
    setStored(KEYS.EXPENSES, expenses);
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
  deleteExpense(id: string): void {
    const expenses = this.getExpenses().filter((e) => e.id !== id);
    setStored(KEYS.EXPENSES, expenses);
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
  saveMessage(msg: ChatMessage): void {
    const messages = this.getMessages();
    messages.push(msg);
    setStored(KEYS.MESSAGES, messages);
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
  }
};
