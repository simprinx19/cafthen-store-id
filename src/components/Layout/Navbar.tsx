import React, { useState } from 'react';
import { 
  Building2, 
  ShoppingBag, 
  User, 
  ShieldCheck, 
  Lock, 
  Menu, 
  X, 
  DollarSign, 
  Phone, 
  Mail, 
  ChevronRight,
  LogOut,
  Sparkles,
  Home,
  Users,
  Image as ImageIcon,
  MapPin,
  FileCheck2,
  Layers,
  ArrowRight,
  UserCheck,
  Shield,
  HelpCircle,
  Clock,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { CompanyProfileData, UserProfile } from '../../types';
import { formatUSD } from '../../utils/formatters';
import { GOOGLE_USD_IDR_SEARCH_URL, ExchangeRateService } from '../../services/exchangeRateService';

interface NavbarProps {
  currentPage: 'home' | 'admin' | 'user';
  onNavigate: (page: 'home' | 'admin' | 'user') => void;
  currentUser: UserProfile | null;
  isAdminLoggedIn: boolean;
  onOpenAuthModal: () => void;
  onUserLogout: () => void;
  onAdminLogout: () => void;
  currency: 'IDR' | 'USD';
  onToggleCurrency: () => void;
  exchangeRate: number;
  company: CompanyProfileData;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
  currentUser,
  isAdminLoggedIn,
  onOpenAuthModal,
  onUserLogout,
  onAdminLogout,
  currency,
  onToggleCurrency,
  exchangeRate,
  company
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    if (currentPage !== 'home') {
      onNavigate('home');
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 150);
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* 1. TOP UTILITY STRIP */}
      <div className="bg-slate-950 text-white text-[11px] py-1.5 px-3 sm:px-6 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          {/* Company Legal Banner & Contact */}
          <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold tracking-tight">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>PT. CAFTHEN INDO PROJECT</span>
            </div>
            <span className="hidden sm:inline text-slate-600">|</span>
            <div className="hidden md:flex items-center gap-1.5 text-slate-300">
              <Phone className="w-3 h-3 text-emerald-400 shrink-0" />
              <span>{company.phone}</span>
            </div>
            <span className="hidden lg:inline text-slate-600">|</span>
            <div className="hidden lg:flex items-center gap-1.5 text-slate-300">
              <Mail className="w-3 h-3 text-blue-400 shrink-0" />
              <span>{company.email}</span>
            </div>
          </div>

          {/* Right Utilities (Live Rate Google Link & Currency Toggle) */}
          <div className="flex items-center gap-2 sm:gap-3 ml-auto">
            <div className="flex items-center gap-1.5 text-slate-300 font-mono text-[10px] bg-slate-900/90 px-2.5 py-1 rounded-lg border border-slate-700/80 shadow-xs">
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Kurs USD:
              </span>
              <span className="font-extrabold text-white">1$ = Rp{exchangeRate.toLocaleString('id-ID')}</span>
              <a
                href={GOOGLE_USD_IDR_SEARCH_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-1 pl-1 border-l border-slate-700 text-amber-400 hover:text-amber-300 flex items-center gap-0.5 hover:underline font-sans font-bold"
                title="Cek & Pantau Kurs USD ke Rupiah Hari Ini di Google Search (Live Market)"
              >
                <span>Google</span>
                <ExternalLink className="w-2.5 h-2.5 shrink-0" />
              </a>
            </div>

            <button
              onClick={onToggleCurrency}
              className="px-2.5 py-1 rounded-lg bg-blue-900 hover:bg-blue-800 text-white text-[10px] font-black tracking-wider transition-colors cursor-pointer border border-blue-700/60 flex items-center gap-1"
              title="Ganti Format Tampilan Harga (IDR / USD)"
            >
              <span>Mata Uang:</span>
              <span className="text-amber-300 font-black">{currency}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER NAVIGATION BAR */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="h-16 sm:h-20 flex items-center justify-between gap-3">
          
          {/* BRAND LOGO & CORPORATE TITLE */}
          <div
            onClick={() => onNavigate('home')}
            className="flex items-center gap-3 cursor-pointer group shrink-0"
          >
            {company.logoUrl ? (
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white border border-slate-200 shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all flex items-center justify-center p-1 overflow-hidden shrink-0">
                <img
                  src={company.logoUrl}
                  alt={company.companyName}
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-blue-950 via-blue-900 to-indigo-900 text-white flex items-center justify-center font-black text-lg sm:text-xl shadow-md group-hover:scale-105 transition-transform shrink-0">
                CIP
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-base sm:text-lg tracking-tight text-slate-950 group-hover:text-blue-950 transition-colors block">
                  {company.storeName}
                </span>
                <span className="hidden xl:inline-block px-1.5 py-0.5 bg-blue-50 text-blue-900 text-[9px] font-extrabold rounded border border-blue-200">
                  OFFICIAL
                </span>
              </div>
              <p className="text-[11px] sm:text-xs font-semibold text-slate-500 line-clamp-1">
                {company.companyName}
              </p>
            </div>
          </div>

          {/* DESKTOP NAVIGATION MENU (CLEAN, PROPORTIONAL & TYPOGRAPHICALLY REFINED) */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 text-xs font-semibold text-slate-700">
            {/* Beranda */}
            <button
              onClick={() => onNavigate('home')}
              className={`px-3 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                currentPage === 'home'
                  ? 'bg-blue-900 text-white font-bold shadow-xs'
                  : 'hover:text-blue-950 hover:bg-slate-100/80 text-slate-700'
              }`}
            >
              <Home className="w-3.5 h-3.5 shrink-0" />
              <span>Beranda</span>
            </button>

            {/* Profil Perusahaan Anchor */}
            <button
              onClick={() => scrollToSection('profil-perusahaan')}
              className="px-2.5 py-2 rounded-xl hover:text-blue-950 hover:bg-slate-100/80 transition-colors cursor-pointer flex items-center gap-1.5 text-slate-700"
            >
              <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>Profil</span>
            </button>

            {/* Tim Direksi Anchor */}
            <button
              onClick={() => scrollToSection('tim-organisasi')}
              className="px-2.5 py-2 rounded-xl hover:text-blue-950 hover:bg-slate-100/80 transition-colors cursor-pointer flex items-center gap-1.5 text-slate-700"
            >
              <Users className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>Tim Direksi</span>
            </button>

            {/* Marketplace Produk Anchor */}
            <button
              onClick={() => scrollToSection('marketplace-produk')}
              className="px-3 py-2 rounded-xl hover:text-blue-950 hover:bg-slate-100/80 transition-colors cursor-pointer flex items-center gap-1.5 text-slate-700"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-blue-700 shrink-0" />
              <span>Marketplace</span>
              <span className="px-1.5 py-0.2 bg-blue-100 text-blue-900 text-[10px] font-bold rounded-full ml-0.5">
                Katalog
              </span>
            </button>

            {/* Foto & Video Kegiatan Anchor */}
            <button
              onClick={() => scrollToSection('kegiatan-kerja')}
              className="px-2.5 py-2 rounded-xl hover:text-blue-950 hover:bg-slate-100/80 transition-colors cursor-pointer flex items-center gap-1.5 text-slate-700"
            >
              <ImageIcon className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>Kegiatan</span>
            </button>

            {/* Lokasi Kantor & Kontak Anchor */}
            <button
              onClick={() => scrollToSection('lokasi-kantor')}
              className="px-2.5 py-2 rounded-xl hover:text-blue-950 hover:bg-slate-100/80 transition-colors cursor-pointer flex items-center gap-1.5 text-slate-700"
            >
              <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>Lokasi</span>
            </button>

            {/* Divider */}
            <div className="h-5 w-[1px] bg-slate-300 mx-1"></div>

            {/* Portal User Button */}
            <button
              onClick={() => onNavigate('user')}
              className={`px-3 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                currentPage === 'user'
                  ? 'bg-blue-900 text-white font-bold shadow-xs'
                  : 'hover:text-blue-950 hover:bg-blue-50 text-slate-800'
              }`}
              title="Buka Portal Akun Konsumen"
            >
              <UserCheck className={`w-3.5 h-3.5 ${currentPage === 'user' ? 'text-white' : 'text-blue-700'}`} />
              <span>Portal User</span>
            </button>

            {/* Portal Admin Button */}
            <button
              onClick={() => onNavigate('admin')}
              className={`px-3 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                currentPage === 'admin'
                  ? 'bg-amber-600 text-white font-bold shadow-xs'
                  : 'hover:text-amber-900 hover:bg-amber-50 text-slate-800'
              }`}
              title="Buka Portal Dashboard Administrator"
            >
              <Lock className={`w-3.5 h-3.5 ${currentPage === 'admin' ? 'text-white' : 'text-amber-600'}`} />
              <span>Portal Admin</span>
            </button>
          </nav>

          {/* DESKTOP RIGHT ACTIONS (LOGIN / PROFILE) */}
          <div className="hidden lg:flex items-center gap-2.5">
            {currentUser ? (
              <div className="flex items-center gap-2 p-1 pl-1.5 bg-slate-100 border border-slate-200 rounded-xl">
                <button
                  onClick={() => onNavigate('user')}
                  className="flex items-center gap-2 text-xs font-bold text-slate-900 hover:text-blue-950 transition-colors cursor-pointer py-1 px-1.5"
                >
                  <div className="w-7 h-7 rounded-lg bg-blue-950 text-white flex items-center justify-center font-black text-xs shadow-xs">
                    {currentUser.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left">
                    <span className="block text-[11px] font-bold text-slate-900 truncate max-w-[110px] leading-tight">
                      {currentUser.fullName}
                    </span>
                    <span className="block text-[9px] text-slate-500 font-medium">
                      {currentUser.userType}
                    </span>
                  </div>
                </button>
                <button
                  onClick={onUserLogout}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  title="Keluar dari Akun User"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="px-4 py-2 bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-900 hover:from-blue-900 hover:to-indigo-800 text-white font-bold rounded-xl text-xs shadow-sm hover:shadow transition-all flex items-center gap-2 cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-blue-200" />
                <span>Masuk / Daftar</span>
              </button>
            )}
          </div>

          {/* MOBILE HAMBURGER BUTTON */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2.5 rounded-xl border border-slate-200 text-slate-800 hover:bg-slate-100 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer transition-colors"
              aria-label="Buka Menu Navigasi"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* 3. MOBILE DRAWER NAVIGATION MENU */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white p-4 space-y-4 shadow-xl max-h-[85vh] overflow-y-auto">
          {/* Main 3 Viewport Tabs */}
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5 px-1">
              PILIHAN PORTAL & HALAMAN UTAMA:
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => {
                  onNavigate('home');
                  setIsMobileMenuOpen(false);
                }}
                className={`p-2.5 text-center rounded-xl text-xs font-bold transition-all min-h-[44px] flex flex-col items-center justify-center gap-1 ${
                  currentPage === 'home' ? 'bg-blue-950 text-white shadow-xs' : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                }`}
              >
                <Home className="w-4 h-4" />
                <span>Beranda</span>
              </button>
              <button
                onClick={() => {
                  onNavigate('user');
                  setIsMobileMenuOpen(false);
                }}
                className={`p-2.5 text-center rounded-xl text-xs font-bold transition-all min-h-[44px] flex flex-col items-center justify-center gap-1 ${
                  currentPage === 'user' ? 'bg-blue-900 text-white shadow-xs' : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>Portal User</span>
              </button>
              <button
                onClick={() => {
                  onNavigate('admin');
                  setIsMobileMenuOpen(false);
                }}
                className={`p-2.5 text-center rounded-xl text-xs font-bold transition-all min-h-[44px] flex flex-col items-center justify-center gap-1 ${
                  currentPage === 'admin' ? 'bg-amber-600 text-white shadow-xs' : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                }`}
              >
                <Lock className="w-4 h-4" />
                <span>Portal Admin</span>
              </button>
            </div>
          </div>

          {/* Quick jump anchors for sections */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-1">
              DAFTAR MENU & BAGIAN HALAMAN:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
              <button
                onClick={() => scrollToSection('profil-perusahaan')}
                className="p-2.5 bg-slate-50 hover:bg-blue-50 text-slate-800 rounded-xl flex items-center justify-between text-left font-semibold transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-900" /> Profil Perusahaan & Legalitas
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
              <button
                onClick={() => scrollToSection('tim-organisasi')}
                className="p-2.5 bg-slate-50 hover:bg-blue-50 text-slate-800 rounded-xl flex items-center justify-between text-left font-semibold transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-900" /> Tim Struktur Direksi
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
              <button
                onClick={() => scrollToSection('marketplace-produk')}
                className="p-2.5 bg-slate-50 hover:bg-blue-50 text-slate-800 rounded-xl flex items-center justify-between text-left font-semibold transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-blue-900" /> Katalog Marketplace Produk
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
              <button
                onClick={() => scrollToSection('kegiatan-kerja')}
                className="p-2.5 bg-slate-50 hover:bg-blue-50 text-slate-800 rounded-xl flex items-center justify-between text-left font-semibold transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-blue-900" /> Galeri Foto & Kegiatan Kerja
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
              <button
                onClick={() => scrollToSection('lokasi-kantor')}
                className="p-2.5 bg-slate-50 hover:bg-blue-50 text-slate-800 rounded-xl flex items-center justify-between text-left font-semibold transition-colors cursor-pointer sm:col-span-2"
              >
                <span className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-900" /> Peta Lokasi Kantor & Kontak Resmi
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>

          {/* User Auth Section on Mobile */}
          <div className="pt-2 border-t border-slate-100">
            {currentUser ? (
              <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex items-center gap-2.5 text-xs font-bold text-slate-900 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-blue-950 text-white flex items-center justify-center font-black">
                    {currentUser.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <span className="block truncate text-slate-900 font-bold">{currentUser.fullName}</span>
                    <span className="block text-[10px] text-slate-500 font-normal">{currentUser.email}</span>
                  </div>
                </div>
                <button
                  onClick={onUserLogout}
                  className="text-xs text-rose-600 font-bold px-3 py-1.5 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                >
                  Keluar
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  onOpenAuthModal();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full py-3 bg-gradient-to-r from-blue-950 to-indigo-900 text-white font-bold rounded-xl text-xs shadow min-h-[44px] flex items-center justify-center gap-2"
              >
                <User className="w-4 h-4 text-blue-300" />
                <span>Masuk / Daftar Konsumen</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
