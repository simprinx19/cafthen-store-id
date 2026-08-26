import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  User, 
  Building2, 
  ShoppingBag, 
  FileCheck2, 
  Receipt, 
  Truck, 
  Ship, 
  MapPin, 
  CreditCard, 
  Send, 
  MessageSquare, 
  ShieldCheck, 
  Upload, 
  CheckCircle2, 
  Clock, 
  Edit3, 
  Save, 
  ExternalLink,
  QrCode,
  LogOut,
  Eye,
  EyeOff,
  Copy,
  Check,
  AlertTriangle,
  AlertCircle,
  Sparkles,
  FileText,
  Image as ImageIcon,
  Trash2,
  Lock,
  ArrowRight,
  ShieldAlert,
  HelpCircle
} from 'lucide-react';
import { UserProfile, Order, DigitalContract, ChatMessage } from '../../types';
import { StorageService } from '../../storage';
import { formatIDR, formatUSD, getStatusBadgeClass } from '../../utils/formatters';
import { validateUserProfile } from '../../utils/userValidation';
import { DigitalContractModal } from '../Marketplace/DigitalContractModal';

interface UserDashboardProps {
  currentUser: UserProfile;
  orders: Order[];
  messages: ChatMessage[];
  onLogout: () => void;
  onDataUpdated: () => void;
  onNavigateToMarketplace?: () => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  currentUser,
  orders,
  messages,
  onLogout,
  onDataUpdated,
  onNavigateToMarketplace
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'chat'>('orders');
  const [selectedContract, setSelectedContract] = useState<DigitalContract | null>(null);

  // Profile Edit States
  const [fullName, setFullName] = useState(currentUser.fullName || '');
  const [whatsapp, setWhatsapp] = useState(currentUser.whatsapp || '');
  const [address, setAddress] = useState(currentUser.address || '');
  const [companyName, setCompanyName] = useState(currentUser.companyName || '');
  const [npwp, setNpwp] = useState(currentUser.npwp || '');
  const [nikKtp, setNikKtp] = useState(currentUser.nikKtp || '');
  
  // Document Upload States
  const [photoUrl, setPhotoUrl] = useState(currentUser.photoUrl || '');
  const [ktpUrl, setKtpUrl] = useState(currentUser.ktpUrl || '');
  const [npwpUrl, setNpwpUrl] = useState(currentUser.npwpUrl || '');
  const [comproUrl, setComproUrl] = useState(currentUser.comproUrl || '');
  const [comproFileName, setComproFileName] = useState(currentUser.comproUrl ? 'Company_Profile_Dokumen.pdf' : '');

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileSuccessNotice, setProfileSuccessNotice] = useState(false);

  // Security Credentials visibility
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // File input refs
  const photoInputRef = useRef<HTMLInputElement>(null);
  const ktpInputRef = useRef<HTMLInputElement>(null);
  const npwpInputRef = useRef<HTMLInputElement>(null);
  const comproInputRef = useRef<HTMLInputElement>(null);

  // Sync profile fields if currentUser prop updates
  useEffect(() => {
    setFullName(currentUser.fullName || '');
    setWhatsapp(currentUser.whatsapp || '');
    setAddress(currentUser.address || '');
    setCompanyName(currentUser.companyName || '');
    setNpwp(currentUser.npwp || '');
    setNikKtp(currentUser.nikKtp || '');
    setPhotoUrl(currentUser.photoUrl || '');
    setKtpUrl(currentUser.ktpUrl || '');
    setNpwpUrl(currentUser.npwpUrl || '');
    setComproUrl(currentUser.comproUrl || '');
    if (currentUser.comproUrl) {
      setComproFileName('Company_Profile_Dokumen.pdf');
    }
  }, [currentUser]);

  // Validation Result
  const validation = validateUserProfile(currentUser);

  // Chat message states
  const [chatInput, setChatInput] = useState('');

  // Proof upload modal state
  const [activeUploadOrder, setActiveUploadOrder] = useState<{ orderId: string; milestoneIdx: number } | null>(null);
  const [proofUrl, setProofUrl] = useState('https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80');

  // Filter orders for this user
  const userOrders = orders.filter((o) => o.buyerId === currentUser.id || o.buyerEmail === currentUser.email);

  // Chat messages between user and admin
  const userChatMessages = messages.filter(
    (m) =>
      (m.senderId === currentUser.id && m.recipientId === 'admin') ||
      (m.senderId === 'admin' && m.recipientId === currentUser.id)
  );

  const handleCopyText = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'photo' | 'ktp' | 'npwp' | 'compro'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type !== 'compro' && !file.type.startsWith('image/')) {
      alert('Format file harus berupa Gambar (JPG, PNG, WebP).');
      return;
    }

    if (type === 'compro' && !file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      alert('Format Company Profile wajib berupa Dokumen PDF (.pdf).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const resultStr = uploadEvent.target?.result as string;
      if (type === 'photo') {
        setPhotoUrl(resultStr);
      } else if (type === 'ktp') {
        setKtpUrl(resultStr);
      } else if (type === 'npwp') {
        setNpwpUrl(resultStr);
      } else if (type === 'compro') {
        setComproUrl(resultStr);
        setComproFileName(file.name);
      }

      // Auto save uploaded document immediately
      const updated: UserProfile = {
        ...currentUser,
        photoUrl: type === 'photo' ? resultStr : currentUser.photoUrl,
        ktpUrl: type === 'ktp' ? resultStr : currentUser.ktpUrl,
        npwpUrl: type === 'npwp' ? resultStr : currentUser.npwpUrl,
        comproUrl: type === 'compro' ? resultStr : currentUser.comproUrl
      };
      StorageService.saveUser(updated);
      onDataUpdated();
      setProfileSuccessNotice(true);
      setTimeout(() => setProfileSuccessNotice(false), 2500);
    };

    reader.readAsDataURL(file);
  };

  const handleRemoveDoc = (type: 'photo' | 'ktp' | 'npwp' | 'compro') => {
    if (type === 'photo') setPhotoUrl('');
    if (type === 'ktp') setKtpUrl('');
    if (type === 'npwp') setNpwpUrl('');
    if (type === 'compro') {
      setComproUrl('');
      setComproFileName('');
    }

    const updated: UserProfile = {
      ...currentUser,
      photoUrl: type === 'photo' ? '' : currentUser.photoUrl,
      ktpUrl: type === 'ktp' ? '' : currentUser.ktpUrl,
      npwpUrl: type === 'npwp' ? '' : currentUser.npwpUrl,
      comproUrl: type === 'compro' ? '' : currentUser.comproUrl
    };
    StorageService.saveUser(updated);
    onDataUpdated();
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...currentUser,
      fullName: fullName.trim(),
      whatsapp: whatsapp.trim(),
      address: address.trim(),
      companyName: companyName.trim() || undefined,
      npwp: npwp.trim(),
      nikKtp: nikKtp.trim(),
      photoUrl: photoUrl.trim() || undefined,
      ktpUrl: ktpUrl.trim() || undefined,
      npwpUrl: npwpUrl.trim() || undefined,
      comproUrl: comproUrl.trim() || undefined
    };

    StorageService.saveUser(updated);
    setIsEditingProfile(false);
    setProfileSuccessNotice(true);
    setTimeout(() => setProfileSuccessNotice(false), 3000);
    onDataUpdated();
  };

  const handleSendUserChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentUser.fullName,
      recipientId: 'admin',
      message: chatInput.trim(),
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      isRead: false
    };

    StorageService.saveMessage(newMsg);
    setChatInput('');
    onDataUpdated();
  };

  const handleUploadPaymentProof = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeUploadOrder) return;

    const targetOrder = orders.find((o) => o.id === activeUploadOrder.orderId);
    if (!targetOrder) return;

    const updatedMilestones = [...targetOrder.paymentSchedule];
    if (updatedMilestones[activeUploadOrder.milestoneIdx]) {
      updatedMilestones[activeUploadOrder.milestoneIdx].proofImageUrl = proofUrl;
    }

    const updatedOrder: Order = {
      ...targetOrder,
      paymentSchedule: updatedMilestones
    };

    StorageService.saveOrder(updatedOrder);
    setActiveUploadOrder(null);
    onDataUpdated();
  };

  return (
    <div className="min-h-screen bg-slate-100/70 pb-20">
      {/* User Header */}
      <header className="bg-slate-950 text-white border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              {currentUser.photoUrl ? (
                <img
                  src={currentUser.photoUrl}
                  alt={currentUser.fullName}
                  className="w-13 h-13 rounded-2xl object-cover border-2 border-amber-400/80 shadow-md"
                />
              ) : (
                <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-900 to-indigo-950 flex items-center justify-center font-black text-xl text-white shadow-md border border-white/10">
                  {currentUser.fullName.charAt(0).toUpperCase()}
                </div>
              )}
              {validation.isComplete && (
                <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full border-2 border-slate-950 shadow">
                  <Check className="w-3 h-3" />
                </span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-black text-white">{currentUser.fullName}</h2>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    currentUser.status === 'Verified'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {currentUser.status === 'Verified' ? 'Akun Terverifikasi' : 'Menunggu Verifikasi'}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    validation.isComplete
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  {validation.isComplete ? 'Profil Lengkap 100%' : `Kelengkapan ${validation.completionPercentage}%`}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {currentUser.companyName ? `${currentUser.companyName} • ` : ''}
                {currentUser.userType} • ID: <span className="font-mono text-amber-400 font-bold">{currentUser.id}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {onNavigateToMarketplace && (
              <button
                onClick={onNavigateToMarketplace}
                className="px-3.5 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-blue-700/60 shadow-xs"
              >
                <ShoppingBag className="w-4 h-4 text-amber-300" /> Katalog Marketplace
              </button>
            )}
            <button
              onClick={onLogout}
              className="px-3.5 py-2 bg-white/10 hover:bg-rose-900/60 hover:text-rose-200 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-white/10"
            >
              <LogOut className="w-4 h-4 text-rose-400" /> Keluar
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">

        {/* ========================================================= */}
        {/* MANDATORY PROFILE & DOCUMENT COMPLETION STATUS BANNER */}
        {/* ========================================================= */}
        {!validation.isComplete ? (
          <div className="mb-6 bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-amber-500/10 border-2 border-amber-400/80 rounded-3xl p-5 sm:p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-amber-900 font-black text-sm sm:text-base">
                  <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>DATA & DOKUMEN WAJIB DILENGKAPI UNTUK DAPAT MEMESAN PRODUK</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed max-w-3xl">
                  Sesuai kepatuhan hukum perdagangan komoditas dan penerbitan <strong>Surat Perjanjian Jual Beli (SPJB) Sah</strong>, Anda wajib melengkapi data profil dan mengunggah dokumen legalitas (<strong>Foto Diri, KTP, NPWP</strong>).
                </p>

                {/* Progress bar */}
                <div className="space-y-1 pt-1 max-w-xl">
                  <div className="flex justify-between text-[11px] font-bold text-slate-700">
                    <span>Tingkat Kelengkapan Akun:</span>
                    <span className="text-amber-800 font-mono">{validation.completedCount} dari {validation.totalRequiredCount} Selesai ({validation.completionPercentage}%)</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-amber-500 to-emerald-600 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${validation.completionPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Badges of missing items */}
                <div className="flex flex-wrap gap-1.5 pt-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider self-center mr-1">
                    Item Belum Dilengkapi:
                  </span>
                  {validation.missingRequiredLabels.map((lbl, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 bg-amber-100/90 text-amber-900 border border-amber-300/80 rounded-lg text-[10px] font-bold flex items-center gap-1"
                    >
                      <AlertCircle className="w-3 h-3 text-amber-600 shrink-0" />
                      {lbl}
                    </span>
                  ))}
                </div>
              </div>

              <div className="shrink-0 flex sm:flex-col gap-2">
                <button
                  onClick={() => {
                    setActiveTab('profile');
                    setIsEditingProfile(true);
                    window.scrollTo({ top: 250, behavior: 'smooth' });
                  }}
                  className="w-full px-5 py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02]"
                >
                  <Edit3 className="w-4 h-4" /> Lengkapi Data & Upload Sekarang
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-6 bg-emerald-50 border border-emerald-300 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-emerald-950">Data Profil & Dokumen Legalitas Telah Lengkap (100%)</h4>
                <p className="text-xs text-emerald-800">
                  Akun Anda memenuhi syarat hukum untuk melakukan transaksi pemesanan produk dan penerbitan Kontrak Digital SPJB.
                </p>
              </div>
            </div>
            {onNavigateToMarketplace && (
              <button
                onClick={onNavigateToMarketplace}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shrink-0 transition-colors shadow-xs"
              >
                <ShoppingBag className="w-3.5 h-3.5" /> Buat Pesanan Baru
              </button>
            )}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex gap-2 overflow-x-auto border-b border-slate-200 pb-3 mb-6">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-blue-900 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <ShoppingBag className="w-4 h-4 shrink-0" />
            <span>Data Pemesanan & Kontrak</span>
            <span className="px-1.5 py-0.2 bg-amber-400 text-slate-950 text-[10px] font-black rounded-full">
              {userOrders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-blue-900 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <User className="w-4 h-4 shrink-0" />
            <span>Data Profil & Dokumen Wajib</span>
            {!validation.isComplete && (
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'chat'
                ? 'bg-blue-900 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <MessageSquare className="w-4 h-4 shrink-0" />
            <span>Chat Konsultasi Admin</span>
          </button>
        </div>

        {/* TAB 1: DATA PEMESANAN & KONTRAK */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {userOrders.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div className="w-16 h-16 bg-blue-50 text-blue-900 rounded-3xl flex items-center justify-center mx-auto">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-slate-800">Belum Ada Pemesanan Produk Aktif</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  {validation.isComplete
                    ? 'Jelajahi katalog produk kami untuk memesan Batubara, Pasir Agregat, Besi Beton, atau Semen Curah dengan Kontrak Digital SPJB sah.'
                    : 'Pastikan Anda telah melengkapi seluruh data profil dan mengunggah foto KTP serta NPWP di tab Profil agar dapat melakukan pemesanan.'}
                </p>
                {onNavigateToMarketplace && validation.isComplete ? (
                  <button
                    onClick={onNavigateToMarketplace}
                    className="px-6 py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-md inline-flex items-center gap-2 cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4 text-amber-300" /> Buka Katalog Produk
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setActiveTab('profile');
                      setIsEditingProfile(true);
                    }}
                    className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md inline-flex items-center gap-2 cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" /> Lengkapi Data Profil Terlebih Dahulu
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {userOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5 hover:shadow-md transition-all"
                  >
                    {/* Header Item */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black font-mono px-2.5 py-1 bg-blue-100 text-blue-900 rounded-lg">
                            {order.id}
                          </span>
                          <span className="text-xs text-slate-400">
                            {new Date(order.createdAt).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                        <h3 className="text-lg font-black text-slate-900 mt-1">
                          {order.productName} ({order.quantity.toLocaleString('id-ID')} {order.unit})
                        </h3>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${getStatusBadgeClass(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                    </div>

                    {/* 3 Detail Boxes */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      <div className="p-4 bg-slate-50 rounded-2xl space-y-1">
                        <span className="text-[10px] text-slate-500 font-bold uppercase">Total Nilai Transaksi</span>
                        <div className="text-base font-black text-slate-900 font-mono">
                          {formatIDR(order.totalPriceIDR)}
                        </div>
                        <div className="text-emerald-700 font-semibold text-[11px]">
                          PPN 11%: {formatIDR(order.taxSystem.ppnAmount)} ({order.taxSystem.type})
                        </div>
                      </div>

                      <div className="p-4 bg-slate-50 rounded-2xl space-y-1">
                        <span className="text-[10px] text-slate-500 font-bold uppercase">Pola Pembelian & Armada</span>
                        <div className="font-bold text-blue-900 text-sm">
                          {order.purchasePattern} • {order.shippingMethod}
                        </div>
                        {order.francoLocation && (
                          <div className="text-slate-600 truncate">
                            Tujuan: {order.francoLocation}
                          </div>
                        )}
                        {order.francoCoordinateMapsUrl && (
                          <a
                            href={order.francoCoordinateMapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-amber-700 underline text-[11px] font-mono flex items-center gap-1"
                          >
                            <MapPin className="w-3 h-3" /> Titik Peta Koordinat
                          </a>
                        )}
                      </div>

                      <div className="p-4 bg-slate-50 rounded-2xl space-y-1">
                        <span className="text-[10px] text-slate-500 font-bold uppercase">Skema & Metode Pembayaran</span>
                        <div className="font-bold text-slate-900 text-sm">{order.paymentScheme}</div>
                        <div className="text-slate-600">Metode: {order.paymentMethod}</div>
                      </div>
                    </div>

                    {/* Milestones Payment Schedule */}
                    <div className="space-y-3">
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                        Jadwal Pembayaran Termin & Status Pelunasan:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {order.paymentSchedule.map((milestone, idx) => (
                          <div
                            key={milestone.id}
                            className={`p-4 rounded-2xl border flex flex-col justify-between ${
                              milestone.isPaid
                                ? 'bg-emerald-50/70 border-emerald-200'
                                : 'bg-white border-slate-200'
                            }`}
                          >
                            <div>
                              <div className="flex justify-between items-center text-xs font-bold">
                                <span>{milestone.name} ({milestone.percentage}%)</span>
                                {milestone.isPaid ? (
                                  <span className="text-emerald-700 flex items-center gap-1 text-[10px]">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Lunas
                                  </span>
                                ) : (
                                  <span className="text-amber-700 text-[10px]">Belum Dibayar</span>
                                )}
                              </div>
                              <div className="font-mono text-sm font-black text-slate-900 mt-1">
                                {formatIDR(milestone.amountIDR)}
                              </div>
                            </div>

                            <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                              {milestone.proofImageUrl ? (
                                <a
                                  href={milestone.proofImageUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-700 underline text-[11px] flex items-center gap-1"
                                >
                                  <ExternalLink className="w-3 h-3" /> Bukti Unggah
                                </a>
                              ) : (
                                <button
                                  onClick={() =>
                                    setActiveUploadOrder({ orderId: order.id, milestoneIdx: idx })
                                  }
                                  className="px-2.5 py-1 bg-blue-100 hover:bg-blue-200 text-blue-900 font-bold text-[10px] rounded-lg flex items-center gap-1 cursor-pointer"
                                >
                                  <Upload className="w-3 h-3" /> Unggah Bukti
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions: View Signed Contract */}
                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => setSelectedContract(order.contract)}
                        className="px-5 py-2.5 bg-gradient-to-r from-blue-900 to-indigo-900 hover:from-blue-800 hover:to-indigo-800 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow cursor-pointer"
                      >
                        <FileCheck2 className="w-4 h-4 text-amber-400" />
                        Buka Surat Perjanjian Kontrak Digital (Tanda Tangan & QR)
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: DATA PROFIL USER & DOKUMEN WAJIB */}
        {activeTab === 'profile' && (
          <div className="max-w-4xl mx-auto space-y-6">

            {/* CARD A: KREDENSIAL AKUN PENDAFTARAN AWAL (USERNAME & PASSWORD) */}
            <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white p-6 sm:p-7 rounded-3xl shadow-lg border border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-md">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">Kredensial Akun Pendaftaran Awal</h3>
                    <p className="text-xs text-slate-300">Data Username dan Kata Sandi yang Anda masukkan saat awal pendaftaran</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-amber-400 bg-amber-400/10 px-3 py-1 rounded-xl border border-amber-400/20 font-semibold self-start sm:self-auto">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Kredensial Resmi Tersimpan</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5 text-xs">
                {/* Username Box */}
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-2">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                    Username / ID Login
                  </span>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-mono font-bold text-amber-300 truncate">
                      {currentUser.username || currentUser.email.split('@')[0]}
                    </span>
                    <button
                      onClick={() => handleCopyText(currentUser.username || currentUser.email.split('@')[0], 'username')}
                      className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      title="Salin Username"
                    >
                      {copiedField === 'username' ? (
                        <span className="text-emerald-400 flex items-center gap-0.5"><Check className="w-3 h-3" /> Tersalin</span>
                      ) : (
                        <span className="flex items-center gap-0.5"><Copy className="w-3 h-3" /> Salin</span>
                      )}
                    </button>
                  </div>
                </div>

                {/* Password Box */}
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-2">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                    Kata Sandi (Password Pendaftaran)
                  </span>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-mono font-bold text-white tracking-wider">
                      {showPassword ? (currentUser.password || 'password123') : '••••••••••••'}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setShowPassword(!showPassword)}
                        className="p-1.5 bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                        title={showPassword ? 'Sembunyikan Kata Sandi' : 'Lihat Kata Sandi'}
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => handleCopyText(currentUser.password || 'password123', 'password')}
                        className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        title="Salin Password"
                      >
                        {copiedField === 'password' ? (
                          <span className="text-emerald-400 flex items-center gap-0.5"><Check className="w-3 h-3" /> Tersalin</span>
                        ) : (
                          <span className="flex items-center gap-0.5"><Copy className="w-3 h-3" /> Salin</span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
                <span>Terdaftar sejak: <strong className="text-slate-200">{currentUser.registeredAt || 'Agustus 2026'}</strong></span>
                <span>Alamat Email: <strong className="text-slate-200 font-mono">{currentUser.email}</strong></span>
              </div>
            </div>

            {/* CARD B: DOKUMEN WAJIB DIUPLOAD (FOTO, KTP, NPWP, COMPRO) */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-slate-900">Upload Dokumen Legalitas Pembeli</h3>
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-900 text-[10px] font-black rounded-md">
                      SYARAT PEMESANAN
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Unggah berkas asli penanggung jawab transaksi atau profil badan usaha untuk verifikasi kontrak.
                  </p>
                </div>
              </div>

              {/* 4 Upload Boxes Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                
                {/* 1. UPLOAD FOTO DIRI / PROFIL */}
                <div className="p-5 rounded-2xl border-2 border-slate-200 bg-slate-50 flex flex-col justify-between space-y-4 hover:border-blue-300 transition-colors">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                        <ImageIcon className="w-4 h-4 text-blue-700" />
                        1. Upload Foto Profil / Diri
                      </span>
                      <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[9px] font-black rounded uppercase">
                        Wajib Gambar
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Format: Gambar (JPG, PNG, WebP). Foto diri penanggung jawab.
                    </p>
                  </div>

                  {/* Preview or Empty Box */}
                  {photoUrl ? (
                    <div className="relative rounded-xl overflow-hidden border border-slate-300 bg-white p-2 flex items-center gap-3">
                      <img
                        src={photoUrl}
                        alt="Foto Profil"
                        className="w-16 h-16 rounded-lg object-cover border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Foto Terunggah
                        </span>
                        <p className="text-[10px] text-slate-500 truncate">Foto siap digunakan untuk SPJB</p>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            type="button"
                            onClick={() => photoInputRef.current?.click()}
                            className="text-[10px] text-blue-700 font-bold hover:underline cursor-pointer"
                          >
                            Ganti Foto
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveDoc('photo')}
                            className="text-[10px] text-rose-600 font-bold hover:underline cursor-pointer"
                          >
                            Hapus
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => photoInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-300 hover:border-blue-600 rounded-xl p-4 text-center cursor-pointer bg-white transition-colors"
                    >
                      <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                      <span className="text-xs font-bold text-blue-900 block">Pilih / Seret Foto</span>
                      <span className="text-[10px] text-slate-400">JPG, PNG atau WebP (Maks 5MB)</span>
                    </div>
                  )}

                  <input
                    type="file"
                    ref={photoInputRef}
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'photo')}
                  />
                </div>

                {/* 2. UPLOAD KTP */}
                <div className="p-5 rounded-2xl border-2 border-slate-200 bg-slate-50 flex flex-col justify-between space-y-4 hover:border-blue-300 transition-colors">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-blue-700" />
                        2. Upload Dokumen KTP Asli
                      </span>
                      <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[9px] font-black rounded uppercase">
                        Wajib Gambar
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Format: Gambar (JPG, PNG, WebP). Foto KTP jelas & terbaca.
                    </p>
                  </div>

                  {/* Preview or Empty Box */}
                  {ktpUrl ? (
                    <div className="relative rounded-xl overflow-hidden border border-slate-300 bg-white p-2 flex items-center gap-3">
                      <img
                        src={ktpUrl}
                        alt="Foto KTP"
                        className="w-16 h-16 rounded-lg object-cover border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> KTP Terunggah
                        </span>
                        <p className="text-[10px] text-slate-500 truncate">Dokumen identitas sah terlampir</p>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            type="button"
                            onClick={() => ktpInputRef.current?.click()}
                            className="text-[10px] text-blue-700 font-bold hover:underline cursor-pointer"
                          >
                            Ganti KTP
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveDoc('ktp')}
                            className="text-[10px] text-rose-600 font-bold hover:underline cursor-pointer"
                          >
                            Hapus
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => ktpInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-300 hover:border-blue-600 rounded-xl p-4 text-center cursor-pointer bg-white transition-colors"
                    >
                      <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                      <span className="text-xs font-bold text-blue-900 block">Upload Foto KTP</span>
                      <span className="text-[10px] text-slate-400">JPG, PNG atau WebP (Maks 5MB)</span>
                    </div>
                  )}

                  <input
                    type="file"
                    ref={ktpInputRef}
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'ktp')}
                  />
                </div>

                {/* 3. UPLOAD NPWP */}
                <div className="p-5 rounded-2xl border-2 border-slate-200 bg-slate-50 flex flex-col justify-between space-y-4 hover:border-blue-300 transition-colors">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                        <CreditCard className="w-4 h-4 text-blue-700" />
                        3. Upload Dokumen NPWP
                      </span>
                      <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[9px] font-black rounded uppercase">
                        Wajib Gambar
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Format: Gambar (JPG, PNG, WebP). Kartu NPWP Pribadi atau Badan.
                    </p>
                  </div>

                  {/* Preview or Empty Box */}
                  {npwpUrl ? (
                    <div className="relative rounded-xl overflow-hidden border border-slate-300 bg-white p-2 flex items-center gap-3">
                      <img
                        src={npwpUrl}
                        alt="Foto NPWP"
                        className="w-16 h-16 rounded-lg object-cover border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> NPWP Terunggah
                        </span>
                        <p className="text-[10px] text-slate-500 truncate">Faktur Pajak e-Faktur ECoretax</p>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            type="button"
                            onClick={() => npwpInputRef.current?.click()}
                            className="text-[10px] text-blue-700 font-bold hover:underline cursor-pointer"
                          >
                            Ganti NPWP
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveDoc('npwp')}
                            className="text-[10px] text-rose-600 font-bold hover:underline cursor-pointer"
                          >
                            Hapus
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => npwpInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-300 hover:border-blue-600 rounded-xl p-4 text-center cursor-pointer bg-white transition-colors"
                    >
                      <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                      <span className="text-xs font-bold text-blue-900 block">Upload Foto Kartu NPWP</span>
                      <span className="text-[10px] text-slate-400">JPG, PNG atau WebP (Maks 5MB)</span>
                    </div>
                  )}

                  <input
                    type="file"
                    ref={npwpInputRef}
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'npwp')}
                  />
                </div>

                {/* 4. UPLOAD COMPRO PERUSAHAAN (OPSIONAL JIKA PERUSAHAAN, FORMAT PDF) */}
                <div className="p-5 rounded-2xl border-2 border-slate-200 bg-slate-50 flex flex-col justify-between space-y-4 hover:border-blue-300 transition-colors">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-blue-700" />
                        4. Upload Compro Perusahaan
                      </span>
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[9px] font-black rounded uppercase">
                        Opsional PDF
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Format: Dokumen PDF (.pdf). Khusus entitas PT / CV / Koperasi.
                    </p>
                  </div>

                  {/* Preview or Empty Box */}
                  {comproUrl ? (
                    <div className="relative rounded-xl overflow-hidden border border-slate-300 bg-white p-3 flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-black text-xs shrink-0 border border-rose-200">
                        PDF
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-bold text-emerald-800 flex items-center gap-1 truncate">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> {comproFileName || 'Compro_Company.pdf'}
                        </span>
                        <p className="text-[10px] text-slate-500 truncate">Dokumen profil perusahaan terlampir</p>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            type="button"
                            onClick={() => comproInputRef.current?.click()}
                            className="text-[10px] text-blue-700 font-bold hover:underline cursor-pointer"
                          >
                            Ganti PDF
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveDoc('compro')}
                            className="text-[10px] text-rose-600 font-bold hover:underline cursor-pointer"
                          >
                            Hapus
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => comproInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-300 hover:border-blue-600 rounded-xl p-4 text-center cursor-pointer bg-white transition-colors"
                    >
                      <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                      <span className="text-xs font-bold text-blue-900 block">Upload File Compro (PDF)</span>
                      <span className="text-[10px] text-slate-400">Format .pdf (Maks 15MB)</span>
                    </div>
                  )}

                  <input
                    type="file"
                    ref={comproInputRef}
                    accept="application/pdf, .pdf"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'compro')}
                  />
                </div>

              </div>
            </div>

            {/* CARD C: FORM DATA PROFIL USER LENGKAP */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <h3 className="text-lg font-black text-slate-900">Data Identitas Lengkap & Domisili</h3>
                  <p className="text-xs text-slate-500">Data ini dicetak otomatis pada Lembar SPJB & e-Faktur Pajak</p>
                </div>

                {!isEditingProfile && (
                  <button
                    onClick={() => setIsEditingProfile(true)}
                    className="px-3.5 py-2 bg-blue-100 hover:bg-blue-200 text-blue-900 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit Data
                  </button>
                )}
              </div>

              {profileSuccessNotice && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Perubahan profil dan dokumen berhasil diperbarui!</span>
                </div>
              )}

              {isEditingProfile ? (
                <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Nama Lengkap Penanggung Jawab *
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Contoh: Ir. Ahmad Zulkarnain"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none text-slate-900 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Nomor WhatsApp Aktif *
                      </label>
                      <input
                        type="tel"
                        required
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value)}
                        placeholder="+6281234567890"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none text-slate-900 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Nomor NIK KTP (16 Digit) *
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={16}
                        value={nikKtp}
                        onChange={(e) => setNikKtp(e.target.value)}
                        placeholder="16 digit angka NIK KTP"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none text-slate-900 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Nomor NPWP Perpajakan *
                      </label>
                      <input
                        type="text"
                        required
                        value={npwp}
                        onChange={(e) => setNpwp(e.target.value)}
                        placeholder="Contoh: 01.234.567.8-901.000"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none text-slate-900 font-mono"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Nama Perusahaan / Instansi (Wajib untuk Pembeli Badan Usaha)
                      </label>
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Contoh: PT. JAYA ABADI KONSTRUKSI NUSANTARA"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none text-slate-900 font-medium"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Alamat Lengkap Kantor / Domisili Proyek *
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Jl. Nama Jalan No. XX, Kelurahan, Kecamatan, Kota / Kabupaten, Provinsi"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end gap-2 border-t">
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(false)}
                      className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-bold"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
                    >
                      <Save className="w-4 h-4" /> Simpan Data Profil
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3.5 bg-slate-50 rounded-xl">
                      <span className="text-slate-500 text-[10px] uppercase font-bold block">Nama Lengkap Penanggung Jawab</span>
                      <span className="text-sm font-bold text-slate-900">{currentUser.fullName || <span className="text-rose-600 italic">Belum diisi</span>}</span>
                    </div>

                    <div className="p-3.5 bg-slate-50 rounded-xl">
                      <span className="text-slate-500 text-[10px] uppercase font-bold block">Nomor WhatsApp</span>
                      <span className="text-sm font-mono text-slate-900">{currentUser.whatsapp || <span className="text-rose-600 italic">Belum diisi</span>}</span>
                    </div>

                    <div className="p-3.5 bg-slate-50 rounded-xl">
                      <span className="text-slate-500 text-[10px] uppercase font-bold block">Nomor NIK KTP</span>
                      <span className="text-sm font-mono text-slate-900">{currentUser.nikKtp || <span className="text-rose-600 italic">Belum diisi</span>}</span>
                    </div>

                    <div className="p-3.5 bg-slate-50 rounded-xl">
                      <span className="text-slate-500 text-[10px] uppercase font-bold block">NPWP Perpajakan</span>
                      <span className="text-sm font-mono text-slate-900">{currentUser.npwp || <span className="text-rose-600 italic">Belum diisi</span>}</span>
                    </div>

                    {currentUser.companyName && (
                      <div className="p-3.5 bg-slate-50 rounded-xl sm:col-span-2">
                        <span className="text-slate-500 text-[10px] uppercase font-bold block">Nama Perusahaan</span>
                        <span className="text-sm font-bold text-blue-950">{currentUser.companyName}</span>
                      </div>
                    )}

                    <div className="p-3.5 bg-slate-50 rounded-xl sm:col-span-2">
                      <span className="text-slate-500 text-[10px] uppercase font-bold block">Alamat Domisili / Kantor</span>
                      <span className="text-xs text-slate-800 leading-relaxed font-medium">
                        {currentUser.address || <span className="text-rose-600 italic">Belum diisi</span>}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 3: CHAT KE ADMIN */}
        {activeTab === 'chat' && (
          <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[560px]">
            <div className="p-4 bg-slate-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow">
                  CIP
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">Layanan Konsultasi Resmi PT. CAFTHEN INDO PROJECT</h4>
                  <p className="text-[11px] text-amber-300">Tim Legalitas, Direksi & Logistik Pelabuhan</p>
                </div>
              </div>
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Online
              </span>
            </div>

            <div className="flex-1 p-5 overflow-y-auto space-y-3 bg-slate-50">
              {userChatMessages.length === 0 ? (
                <div className="text-center py-16 text-slate-400 text-xs">
                  Mulai percakapan dengan Customer Service & Administrator PT. CAFTHEN INDO PROJECT mengenai status pengapalan, faktur ECoretax, atau revisi kontrak.
                </div>
              ) : (
                userChatMessages.map((msg) => {
                  const isMe = msg.senderId === currentUser.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[75%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                          isMe
                            ? 'bg-blue-900 text-white rounded-tr-none shadow-xs'
                            : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none shadow-xs'
                        }`}
                      >
                        <p>{msg.message}</p>
                        <span
                          className={`text-[10px] block mt-1.5 text-right ${
                            isMe ? 'text-blue-200' : 'text-slate-400'
                          }`}
                        >
                          {msg.timestamp}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <form onSubmit={handleSendUserChat} className="p-3 bg-white border-t border-slate-200 flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Tulis pesan atau pertanyaan ke tim Admin PT. CIP..."
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow"
              >
                <Send className="w-3.5 h-3.5" /> Kirim
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Contract Detail Modal */}
      {selectedContract && (
        <DigitalContractModal
          contract={selectedContract}
          isOpen={Boolean(selectedContract)}
          onClose={() => setSelectedContract(null)}
        />
      )}

      {/* Upload Payment Proof Modal */}
      {activeUploadOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <h4 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Upload className="w-5 h-5 text-blue-700" />
              Unggah Bukti Transfer Pembayaran
            </h4>
            <p className="text-xs text-slate-500">
              Kirimkan bukti slip transfer bank atau screenshot transaksi pembayaran untuk diverifikasi oleh tim keuangan.
            </p>

            <form onSubmit={handleUploadPaymentProof} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">URL Gambar / Slip Bukti Transfer *</label>
                <input
                  type="url"
                  required
                  value={proofUrl}
                  onChange={(e) => setProofUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              {proofUrl && (
                <div className="p-2 border rounded-xl bg-slate-50">
                  <img
                    src={proofUrl}
                    alt="Preview Bukti"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveUploadOrder(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-xl shadow cursor-pointer"
                >
                  Simpan Bukti
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
