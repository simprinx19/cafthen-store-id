import React, { useState, useEffect } from 'react';
import heroBgImage from './assets/images/hero_business_background_1787670481567.jpg';
import { Navbar } from './components/Layout/Navbar';
import { Footer } from './components/Layout/Footer';
import { HeroSection } from './components/Home/HeroSection';
import { CompanyProfileSection } from './components/Home/CompanyProfileSection';
import { TeamSection } from './components/Home/TeamSection';
import { ActivityGallerySection } from './components/Home/ActivityGallerySection';
import { VideoSection } from './components/Home/VideoSection';
import { VisiMisiSection } from './components/Home/VisiMisiSection';
import { MapsSection } from './components/Home/MapsSection';
import { EmailContactSection } from './components/Home/EmailContactSection';
import { MarketplaceSection } from './components/Home/MarketplaceSection';
import { AdminDashboard } from './components/Admin/AdminDashboard';
import { UserDashboard } from './components/User/UserDashboard';
import { AuthModal } from './components/Auth/AuthModal';
import { StorageService } from './storage';
import { ExchangeRateService } from './services/exchangeRateService';
import { applyThemeToDOM } from './utils/themeEngine';
import { 
  CompanyProfileData, 
  TeamMember, 
  ActivityPhoto, 
  Product, 
  Order, 
  UserProfile, 
  FinancialReport, 
  ExpenseRecord, 
  ChatMessage,
  ThemeSettings 
} from './types';
import { CheckCircle2, Bell, X, ShieldAlert } from 'lucide-react';

export default function App() {
  // Page Navigation: 'home' | 'admin' | 'user'
  const [currentPage, setCurrentPage] = useState<'home' | 'admin' | 'user'>('home');

  // Theme Settings
  const [theme, setTheme] = useState<ThemeSettings>(StorageService.getThemeSettings());

  // Application Data States
  const [company, setCompany] = useState<CompanyProfileData>(StorageService.getCompanyProfile());
  const [team, setTeam] = useState<TeamMember[]>(StorageService.getTeam());
  const [activities, setActivities] = useState<ActivityPhoto[]>(StorageService.getActivities());
  const [products, setProducts] = useState<Product[]>(StorageService.getProducts());
  const [orders, setOrders] = useState<Order[]>(StorageService.getOrders());
  const [users, setUsers] = useState<UserProfile[]>(StorageService.getUsers());
  const [finance, setFinance] = useState<FinancialReport>(StorageService.getFinancials());
  const [expenses, setExpenses] = useState<ExpenseRecord[]>(StorageService.getExpenses());
  const [messages, setMessages] = useState<ChatMessage[]>(StorageService.getMessages());

  // Currency State
  const [currency, setCurrency] = useState<'IDR' | 'USD'>('IDR');
  const [exchangeRate, setExchangeRate] = useState<number>(ExchangeRateService.getCurrentRate());

  // Authentication States
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(StorageService.getCurrentUser());
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(StorageService.isAdminLoggedIn());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authInitialTab, setAuthInitialTab] = useState<'login' | 'register'>('login');

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync data refresh helper
  const reloadData = () => {
    const currentTheme = StorageService.getThemeSettings();
    setTheme(currentTheme);
    applyThemeToDOM(currentTheme);
    setCompany(StorageService.getCompanyProfile());
    setTeam(StorageService.getTeam());
    setActivities(StorageService.getActivities());
    setProducts(StorageService.getProducts());
    setOrders(StorageService.getOrders());
    setUsers(StorageService.getUsers());
    setFinance(StorageService.getFinancials());
    setExpenses(StorageService.getExpenses());
    setMessages(StorageService.getMessages());
    setCurrentUser(StorageService.getCurrentUser());
    setIsAdminLoggedIn(StorageService.isAdminLoggedIn());
    setExchangeRate(ExchangeRateService.getCurrentRate());
  };

  useEffect(() => {
    applyThemeToDOM(theme);
    reloadData();
    
    // Immediate initial sync on app mount
    StorageService.syncWithServer().then(() => {
      reloadData();
    });

    // Fetch live USD rate from Google Market API
    ExchangeRateService.fetchLiveRate().then(rate => {
      if (rate && rate > 10000) setExchangeRate(rate);
    });

    const handleStorageUpdate = () => {
      reloadData();
    };

    const handleThemeUpdate = (e: any) => {
      if (e.detail) {
        setTheme(e.detail);
        applyThemeToDOM(e.detail);
      }
    };

    const handleRateUpdate = (e: any) => {
      if (e.detail) setExchangeRate(e.detail);
    };

    // Periodic sync with server for cross-device updates (every 8 seconds)
    const syncInterval = setInterval(() => {
      StorageService.syncWithServer().then(() => {
        reloadData();
      });
    }, 8000);

    const handleFocus = () => {
      StorageService.syncWithServer().then(() => {
        reloadData();
      });
    };

    window.addEventListener('cafthen_storage_updated', handleStorageUpdate);
    window.addEventListener('cafthen_theme_updated', handleThemeUpdate);
    window.addEventListener('cafthen_exchange_rate_updated', handleRateUpdate);
    window.addEventListener('storage', handleStorageUpdate);
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(syncInterval);
      window.removeEventListener('cafthen_storage_updated', handleStorageUpdate);
      window.removeEventListener('cafthen_theme_updated', handleThemeUpdate);
      window.removeEventListener('cafthen_exchange_rate_updated', handleRateUpdate);
      window.removeEventListener('storage', handleStorageUpdate);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleAdminLogin = (user: string, pass: string): boolean => {
    const success = StorageService.adminLogin(user, pass);
    if (success) {
      setIsAdminLoggedIn(true);
      showToast('Berhasil masuk sebagai Administrator PT. CAFTHEN INDO PROJECT');
    }
    return success;
  };

  const handleAdminLogout = () => {
    StorageService.adminLogout();
    setIsAdminLoggedIn(false);
    showToast('Admin berhasil keluar.');
    setCurrentPage('home');
  };

  const handleUserLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    showToast(`Selamat datang kembali, ${user.fullName}!`);
    setCurrentPage('user');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUserRegisterSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    reloadData();
    showToast(`Pendaftaran berhasil! Akun ${user.fullName} (${user.userType}) sedang diverifikasi.`);
    setCurrentPage('user');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUserLogout = () => {
    StorageService.logoutUser();
    setCurrentUser(null);
    showToast('Anda telah keluar dari akun konsumen.');
    if (currentPage === 'user') {
      setCurrentPage('home');
    }
  };

  const handleOrderSuccess = (order: Order) => {
    reloadData();
    showToast(`Pesanan #${order.id} berhasil diterbitkan dengan Kontrak Digital & QR Seal!`);
    setCurrentPage('user');
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 selection:bg-amber-400 selection:text-slate-950 font-sans">
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-slate-950 text-white border border-amber-400/50 rounded-2xl shadow-2xl flex items-center gap-3 text-xs animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
          <span className="font-semibold">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white p-1 ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Global Navigation Bar */}
      <Navbar
        currentPage={currentPage}
        onNavigate={(page) => {
          if (page === 'user' && !currentUser) {
            setAuthInitialTab('login');
            setIsAuthModalOpen(true);
            return;
          }
          setCurrentPage(page);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        currentUser={currentUser}
        isAdminLoggedIn={isAdminLoggedIn}
        onOpenAuthModal={() => {
          setAuthInitialTab('login');
          setIsAuthModalOpen(true);
        }}
        onUserLogout={handleUserLogout}
        onAdminLogout={handleAdminLogout}
        currency={currency}
        onToggleCurrency={() => setCurrency(currency === 'IDR' ? 'USD' : 'IDR')}
        exchangeRate={exchangeRate}
        company={company}
      />

      {/* Page Routing Rendering */}
      <main className="flex-1">
        {/* PAGE 1: HALAMAN UTAMA */}
        {currentPage === 'home' && (
          <div className="relative">
            {/* Transparent Watermark / Theme Background overlay for entire main page */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
              <img
                src={heroBgImage}
                alt="Lini Bisnis PT Cafthen Indo Project - Ekspor, Arang Batok, Kelapa Tua, Cangkang Sawit, Konstruksi Sipil"
                className="w-full h-full object-cover opacity-[0.06] filter brightness-90 contrast-125"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/5 to-white/20" />
            </div>

            <div className="relative z-10">
              <HeroSection
                bgImage={heroBgImage}
                company={company}
                onExploreMarketplace={() => {
                  const el = document.getElementById('marketplace-produk');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                onConsultationClick={() => {
                  const el = document.getElementById('kontak-email');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
              />

              <CompanyProfileSection company={company} />

              <TeamSection team={team} />

              <MarketplaceSection
                products={products}
                exchangeRate={exchangeRate}
                currency={currency}
                currentUser={currentUser}
                onRequireAuth={() => {
                  setAuthInitialTab('login');
                  setIsAuthModalOpen(true);
                }}
                onOrderSuccess={handleOrderSuccess}
                onNavigateToDashboard={() => setCurrentPage('user')}
              />

              <ActivityGallerySection activities={activities} />

              <VideoSection company={company} />

              <VisiMisiSection company={company} />

              <MapsSection company={company} />

              <EmailContactSection
                company={company}
                currentUser={currentUser}
                onRequireAuth={() => {
                  setAuthInitialTab('login');
                  setIsAuthModalOpen(true);
                }}
              />
            </div>
          </div>
        )}

        {/* PAGE 2: DASHBOARD ADMIN */}
        {currentPage === 'admin' && (
          <AdminDashboard
            isAdminLoggedIn={isAdminLoggedIn}
            onAdminLogin={handleAdminLogin}
            onAdminLogout={handleAdminLogout}
            company={company}
            team={team}
            activities={activities}
            products={products}
            orders={orders}
            users={users}
            finance={finance}
            expenses={expenses}
            messages={messages}
            exchangeRate={exchangeRate}
            onDataUpdated={reloadData}
          />
        )}

        {/* PAGE 3: DASHBOARD USER */}
        {currentPage === 'user' && currentUser && (
          <UserDashboard
            currentUser={currentUser}
            orders={orders}
            messages={messages}
            onLogout={handleUserLogout}
            onDataUpdated={reloadData}
            onNavigateToMarketplace={() => {
              setCurrentPage('home');
              setTimeout(() => {
                const el = document.getElementById('marketplace-produk');
                el?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
          />
        )}
      </main>

      {/* Global Footer */}
      <Footer
        company={company}
        onNavigate={(page) => {
          if (page === 'user' && !currentUser) {
            setAuthInitialTab('login');
            setIsAuthModalOpen(true);
            return;
          }
          setCurrentPage(page);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Global Login & Registration Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialTab={authInitialTab}
        onLoginSuccess={handleUserLoginSuccess}
        onRegisterSuccess={handleUserRegisterSuccess}
      />
    </div>
  );
}
