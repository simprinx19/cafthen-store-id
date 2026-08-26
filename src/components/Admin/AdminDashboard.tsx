import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  LayoutDashboard, 
  Settings, 
  UserCheck, 
  FileCheck2, 
  Package, 
  DollarSign, 
  MessageSquare, 
  LogOut, 
  ShieldCheck, 
  Building2, 
  Lock,
  Sparkles,
  ChevronRight,
  CreditCard,
  Palette,
  Database,
  RefreshCw,
  CheckCircle2
} from 'lucide-react';
import { 
  CompanyProfileData, 
  TeamMember, 
  ActivityPhoto, 
  Product, 
  Order, 
  UserProfile, 
  FinancialReport, 
  ExpenseRecord, 
  ChatMessage 
} from '../../types';
import { StorageService, DbConnectionInfo } from '../../storage';
import { AdminOverview } from './AdminOverview';
import { AdminCMS } from './AdminCMS';
import { AdminUserVerification } from './AdminUserVerification';
import { AdminOrderVerification } from './AdminOrderVerification';
import { AdminProductManagement } from './AdminProductManagement';
import { AdminFinance } from './AdminFinance';
import { AdminChat } from './AdminChat';
import { AdminPaymentMethods } from './AdminPaymentMethods';
import { AdminThemeSettings } from './AdminThemeSettings';

interface AdminDashboardProps {
  isAdminLoggedIn: boolean;
  onAdminLogin: (user: string, pass: string) => boolean;
  onAdminLogout: () => void;
  company: CompanyProfileData;
  team: TeamMember[];
  activities: ActivityPhoto[];
  products: Product[];
  orders: Order[];
  users: UserProfile[];
  finance: FinancialReport;
  expenses: ExpenseRecord[];
  messages: ChatMessage[];
  exchangeRate: number;
  onDataUpdated: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isAdminLoggedIn,
  onAdminLogin,
  onAdminLogout,
  company,
  team,
  activities,
  products,
  orders,
  users,
  finance,
  expenses,
  messages,
  exchangeRate,
  onDataUpdated
}) => {
  const [currentTab, setCurrentTab] = useState<
    'overview' | 'cms' | 'theme' | 'users' | 'orders' | 'products' | 'payments' | 'finance' | 'chat'
  >('overview');

  // Login form states if not logged in
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // Database Connection Status & Manual Sync
  const [dbStatus, setDbStatus] = useState<DbConnectionInfo>(StorageService.getDbConnectionStatus());
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  useEffect(() => {
    const handleDbStatus = (e: any) => {
      if (e.detail) setDbStatus(e.detail);
    };
    window.addEventListener('cafthen_db_status_changed', handleDbStatus);
    return () => window.removeEventListener('cafthen_db_status_changed', handleDbStatus);
  }, []);

  const handleForceSync = async () => {
    setIsSyncing(true);
    setSyncNotice('Menghubungkan & menyinkronkan data dengan MongoDB Atlas...');
    const res = await StorageService.forceSyncNow();
    onDataUpdated();
    setIsSyncing(false);
    setSyncNotice(res.message);
    setTimeout(() => setSyncNotice(null), 4000);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = onAdminLogin(usernameInput, passwordInput);
    if (!success) {
      setLoginError('Kombinasi Username dan Password Admin tidak valid.');
    } else {
      setLoginError('');
      setUsernameInput('');
      setPasswordInput('');
    }
  };

  // If not logged in as Admin, show login screen
  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4 bg-slate-100">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-blue-900 text-amber-400 rounded-2xl flex items-center justify-center mx-auto shadow-md">
              <Lock className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-black text-slate-900">Portal Dashboard Admin</h2>
            <p className="text-xs text-slate-500">
              Masuk untuk mengelola seluruh operasional PT. CAFTHEN INDO PROJECT
            </p>
          </div>

          {loginError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Username Administrator
              </label>
              <input
                type="text"
                required
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="Masukkan Username Administrator"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none bg-slate-50 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Password Administrator
              </label>
              <input
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Masukkan Password Administrator"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none bg-slate-50 text-slate-900 font-mono"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-blue-900 to-indigo-900 hover:from-blue-800 hover:to-indigo-800 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all cursor-pointer mt-2"
            >
              Masuk ke Dashboard Admin
            </button>
          </form>
        </div>
      </div>
    );
  }

  const navTabs = [
    { id: 'overview', label: 'Ikhtisar & Grafik Penjualan', icon: LayoutDashboard },
    { id: 'cms', label: 'CMS Tampilan Halaman Utama', icon: Settings },
    { id: 'theme', label: 'Tema & Warna Tampilan', icon: Palette },
    { id: 'users', label: 'Verifikasi Akun Baru', icon: UserCheck, badge: users.filter((u) => u.status === 'Pending').length },
    { id: 'orders', label: 'Verifikasi Pesanan & Kontrak', icon: FileCheck2, badge: orders.filter((o) => o.status.includes('Menunggu')).length },
    { id: 'products', label: 'Kelola Produk & Komoditas', icon: Package },
    { id: 'payments', label: 'Metode & Pola Pembayaran', icon: CreditCard },
    { id: 'finance', label: 'Keuangan & Pengeluaran', icon: DollarSign },
    { id: 'chat', label: 'Chat Konsumen', icon: MessageSquare }
  ];

  return (
    <div className="min-h-screen bg-slate-100/70 pb-20">
      {/* Top Admin Header Bar */}
      <header className="bg-slate-950 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {company.logoUrl ? (
              <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 p-1 flex items-center justify-center shadow overflow-hidden shrink-0">
                <img
                  src={company.logoUrl}
                  alt={company.companyName}
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white text-sm shadow shrink-0">
                CIP
              </div>
            )}
            <div className="min-w-0">
              <h1 className="font-extrabold text-xs sm:text-sm md:text-base text-white tracking-tight truncate">
                Dashboard Administrator • {company.storeName || 'CAFTHEN STORE ID'}
              </h1>
              <p className="text-[10px] text-amber-400 font-mono truncate">
                Akun: cipindo • Cluster: MongoDB Atlas (db-compro)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Realtime Database Sync Button */}
            <button
              onClick={handleForceSync}
              disabled={isSyncing}
              title="Klik untuk sinkronisasi database manual"
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                dbStatus.state === 'connected'
                  ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/80'
                  : 'bg-amber-950/70 border-amber-500/40 text-amber-300 hover:bg-amber-900/80'
              }`}
            >
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline">
                {isSyncing ? 'Menyinkronkan...' : 'Atlas Terhubung'}
              </span>
              <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={onAdminLogout}
              className="px-3.5 py-1.5 bg-rose-600/80 hover:bg-rose-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {syncNotice && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-3">
          <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{syncNotice}</span>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        {/* Navigation Tabs Bar */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition-all cursor-pointer shadow-sm ${
                  isActive
                    ? 'bg-blue-900 text-white shadow-md ring-2 ring-blue-600/30'
                    : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {Boolean(tab.badge) && (
                  <span className="px-1.5 py-0.2 bg-amber-400 text-slate-950 text-[10px] font-black rounded-full">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Components Body */}
        <div>
          {currentTab === 'overview' && (
            <AdminOverview
              orders={orders}
              users={users}
              products={products}
              expenses={expenses}
            />
          )}

          {currentTab === 'cms' && (
            <AdminCMS
              company={company}
              team={team}
              activities={activities}
              onDataUpdated={onDataUpdated}
            />
          )}

          {currentTab === 'theme' && (
            <AdminThemeSettings
              onDataUpdated={onDataUpdated}
            />
          )}

          {currentTab === 'users' && (
            <AdminUserVerification
              users={users}
              onDataUpdated={onDataUpdated}
            />
          )}

          {currentTab === 'orders' && (
            <AdminOrderVerification
              orders={orders}
              onDataUpdated={onDataUpdated}
            />
          )}

          {currentTab === 'products' && (
            <AdminProductManagement
              products={products}
              exchangeRate={exchangeRate}
              onDataUpdated={onDataUpdated}
            />
          )}

          {currentTab === 'payments' && (
            <AdminPaymentMethods
              onDataUpdated={onDataUpdated}
            />
          )}

          {currentTab === 'finance' && (
            <AdminFinance
              orders={orders}
              finance={finance}
              expenses={expenses}
              onDataUpdated={onDataUpdated}
            />
          )}

          {currentTab === 'chat' && (
            <AdminChat
              users={users}
              messages={messages}
              onDataUpdated={onDataUpdated}
            />
          )}
        </div>
      </div>
    </div>
  );
};
