import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  MapPin, 
  Truck, 
  Ship, 
  Anchor, 
  FileCheck2, 
  Building2, 
  Receipt, 
  CreditCard, 
  QrCode, 
  Check, 
  AlertCircle, 
  Sparkles,
  Info,
  DollarSign,
  Layers,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { 
  Product, 
  UserProfile, 
  PurchasePattern, 
  ShippingMethod, 
  PaymentMethod, 
  Order,
  CompanyProfileData
} from '../../types';
import { formatIDR, formatUSD } from '../../utils/formatters';
import { StorageService } from '../../storage';
import { DigitalContractModal } from './DigitalContractModal';
import { getProductPatternPrice, PURCHASE_PATTERNS_INFO } from '../../utils/pricing';
import { validateUserProfile } from '../../utils/userValidation';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  initialPattern?: PurchasePattern;
  currentUser: UserProfile | null;
  onRequireAuth: () => void;
  onOrderSuccess: (order: Order) => void;
  onNavigateToDashboard?: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  product,
  initialPattern = 'Franco',
  currentUser,
  onRequireAuth,
  onOrderSuccess,
  onNavigateToDashboard
}) => {
  const company = StorageService.getCompanyProfile();
  const exchangeRate = StorageService.getExchangeRate();
  const paymentSettings = StorageService.getPaymentSettings();

  const userValidation = validateUserProfile(currentUser);

  // Filter only enabled methods configured in Admin
  const availableMethods = paymentSettings.methods.filter((m) => m.enabled);

  const [quantity, setQuantity] = useState<number>(1);
  const [purchasePattern, setPurchasePattern] = useState<PurchasePattern>(initialPattern);
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>('Trucking');
  const [destinationCoordinateLink, setDestinationCoordinateLink] = useState<string>('');
  const [ecoretaxChoice, setEcoretaxChoice] = useState<'Include' | 'Exclude'>('Include');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    (availableMethods[0]?.code as PaymentMethod) || '50:50'
  );

  // Active preview photo index
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  // Digital Contract Preview Stage
  const [showContractModal, setShowContractModal] = useState(false);
  const [pendingContractOrder, setPendingContractOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (initialPattern) {
      setPurchasePattern(initialPattern);
    }
  }, [initialPattern]);

  useEffect(() => {
    // If current method is not among available methods, switch to first available
    if (availableMethods.length > 0 && !availableMethods.some((m) => m.code === paymentMethod)) {
      setPaymentMethod(availableMethods[0].code as PaymentMethod);
    }
  }, [availableMethods, paymentMethod]);

  if (!isOpen) return null;

  // Selected pattern pricing
  const currentPatternPricing = getProductPatternPrice(product, purchasePattern, exchangeRate);
  const patternInfo = PURCHASE_PATTERNS_INFO[purchasePattern];

  // Rules: Jalur Air (Tongkang / Mother Vessel) -> Mandatory ECoretax
  const isWaterRoute = shippingMethod === 'Tongkang' || shippingMethod === 'Mother Vessel';
  const effectiveTaxChoice = isWaterRoute ? 'Include' : ecoretaxChoice;

  const unitPriceIDR = currentPatternPricing.priceIDR;
  const unitPriceUSD = currentPatternPricing.priceUSD;

  const subtotalIDR = unitPriceIDR * (quantity || 1);
  const ppnAmountIDR = effectiveTaxChoice === 'Include' ? Math.round(subtotalIDR * 0.11) : 0;
  const pphAmountIDR = isWaterRoute ? Math.round(subtotalIDR * 0.015) : 0;
  const totalAmountIDR = subtotalIDR + ppnAmountIDR;
  const totalAmountUSD = +(totalAmountIDR / exchangeRate).toFixed(2);

  // Find active method configuration
  const activeMethodConfig = availableMethods.find((m) => m.code === paymentMethod) || paymentSettings.methods.find((m) => m.code === paymentMethod);
  const primaryBank = paymentSettings.bankAccounts.find((b) => b.isPrimary) || paymentSettings.bankAccounts[0] || {
    id: 'bank-default',
    bankName: company.bankAccounts[0]?.bankName || 'Bank Mandiri',
    accountNumber: company.bankAccounts[0]?.accountNumber || '110-00-1849201-9',
    accountHolder: company.bankAccounts[0]?.accountHolder || 'PT. CAFTHEN INDO PROJECT / HENDRI PUTRA.S.Kom',
    branch: 'KC Jambi Telanaipura',
    isPrimary: true
  };

  // Down Payment calculations based on active configured method
  let dpIDR = totalAmountIDR;
  let progressIDR = 0;
  let finalIDR = 0;

  if (activeMethodConfig) {
    const dpPct = activeMethodConfig.downPaymentPercent ?? 100;
    const progPct = activeMethodConfig.progressPaymentPercent ?? 0;
    const finPct = activeMethodConfig.finalPaymentPercent ?? 0;

    dpIDR = Math.round(totalAmountIDR * (dpPct / 100));
    progressIDR = Math.round(totalAmountIDR * (progPct / 100));
    finalIDR = totalAmountIDR - dpIDR - progressIDR;
  } else if (paymentMethod === '50:50') {
    dpIDR = Math.round(totalAmountIDR * 0.5);
    finalIDR = totalAmountIDR - dpIDR;
  } else if (paymentMethod === '50:40:10') {
    dpIDR = Math.round(totalAmountIDR * 0.5);
    progressIDR = Math.round(totalAmountIDR * 0.4);
    finalIDR = totalAmountIDR - dpIDR - progressIDR;
  }

  const handleProceedToContract = () => {
    if (!currentUser) {
      onRequireAuth();
      return;
    }

    // MANDATORY PROFILE & DOCUMENT COMPLETION CHECK
    if (!userValidation.isComplete) {
      const missingList = userValidation.missingRequiredLabels.join(', ');
      alert(
        `PERHATIAN: DATA PROFIL & DOKUMEN BELUM LENGKAP (${userValidation.completionPercentage}% Selesai)\n\n` +
        `Sesuai ketentuan perikatan hukum Surat Perjanjian Jual Beli (SPJB) PT. CAFTHEN INDO PROJECT, Anda wajib melengkapi data profil dan mengunggah dokumen legalitas sebelum dapat melakukan pemesanan produk.\n\n` +
        `Data/Dokumen yang belum lengkap:\n- ${userValidation.missingRequiredLabels.join('\n- ')}\n\n` +
        `Silakan lengkapi di tab Profil pada Dashboard Pengguna.`
      );
      if (onNavigateToDashboard) {
        onClose();
        onNavigateToDashboard();
      }
      return;
    }

    if (quantity <= 0) {
      alert('Jumlah kuantitas pemesanan harus lebih dari 0.');
      return;
    }

    if (quantity > product.stock) {
      alert(`Stok tersedia saat ini hanya ${product.stock} ${product.unit}.`);
      return;
    }

    // Franco rule: Coordinate maps link is MANDATORY
    if (purchasePattern === 'Franco' && !destinationCoordinateLink.trim()) {
      alert('Untuk Pola Pembelian FRANCO (barang diantar sampai lokasi proyek), Kolom "Link Titik Ordinat / Maps Tujuan" WAJIB diisi.');
      return;
    }

    // Create intermediate draft order & open contract modal
    const tempOrder = StorageService.createOrder({
      buyer: currentUser,
      product,
      quantity,
      purchasePattern,
      destinationCoordinateLink: purchasePattern === 'Franco' ? destinationCoordinateLink : undefined,
      shippingMethod,
      paymentMethod,
      ecoretaxTypeChoice: ecoretaxChoice
    });

    setPendingContractOrder(tempOrder);
    setShowContractModal(true);
  };

  const handleContractSigned = (signatureDataUrl: string) => {
    if (!pendingContractOrder) return;

    // Update contract in order with buyer's signature
    const updatedOrder: Order = {
      ...pendingContractOrder,
      contract: {
        ...pendingContractOrder.contract,
        secondParty: {
          ...pendingContractOrder.contract.secondParty,
          signatureDataUrl,
          signedAt: new Date().toLocaleString('id-ID') + ' WIB'
        },
        isSignedByBuyer: true
      },
      status: 'Kontrak Terbit'
    };

    StorageService.saveOrder(updatedOrder);
    setShowContractModal(false);
    onOrderSuccess(updatedOrder);
    onClose();
  };

  return (
    <>
      <AnimatePresence>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/75 backdrop-blur-sm overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative w-full max-w-6xl xl:max-w-7xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[95vh] flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-md">
                  CIP
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-tight">Formulir Pemesanan & Kontrak Pengadaan</h3>
                  <p className="text-xs text-blue-200">PT. CAFTHEN INDO PROJECT • {company.storeName}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Product Summary Banner */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                {/* Images auto carousel / thumbnails */}
                <div className="md:col-span-4 space-y-2">
                  <div className="relative aspect-video sm:aspect-square rounded-xl overflow-hidden bg-slate-900 border border-slate-200">
                    <img
                      src={product.images[activeImageIdx] || product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover transition-all duration-300"
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-blue-900/80 backdrop-blur-sm text-white text-[10px] font-bold rounded">
                      {product.origin}
                    </div>
                  </div>

                  {product.images.length > 1 && (
                    <div className="flex gap-1.5 overflow-x-auto pb-1">
                      {product.images.map((img, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActiveImageIdx(idx)}
                          className={`w-12 h-10 rounded-lg overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                            activeImageIdx === idx ? 'border-blue-600 ring-2 ring-blue-600/30' : 'border-transparent opacity-70 hover:opacity-100'
                          }`}
                        >
                          <img src={img} alt="thumb" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Details & Specs */}
                <div className="md:col-span-8 space-y-2.5">
                  <span className="inline-block px-2.5 py-0.5 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                    {product.category}
                  </span>
                  <h4 className="text-lg font-bold text-slate-900 leading-snug">
                    {product.name}
                  </h4>

                  {/* Dual Currency Price for Selected Pattern */}
                  <div className="flex flex-wrap items-center gap-4 py-2 border-y border-slate-200 bg-white px-3 rounded-xl">
                    <div>
                      <span className="text-[10px] text-slate-500 font-semibold block uppercase tracking-wider">
                        Harga Sistem {purchasePattern.toUpperCase()} (IDR):
                      </span>
                      <span className="text-base font-extrabold text-blue-900 font-mono">
                        {formatIDR(unitPriceIDR)} <span className="text-xs font-normal text-slate-600">/{product.unit}</span>
                      </span>
                    </div>
                    <div className="border-l border-slate-200 pl-4">
                      <span className="text-[10px] text-slate-500 font-semibold block uppercase tracking-wider">
                        Kurs USD ($):
                      </span>
                      <span className="text-base font-extrabold text-emerald-700 font-mono">
                        {formatUSD(unitPriceUSD)} <span className="text-xs font-normal text-slate-600">/{product.unit}</span>
                      </span>
                    </div>
                    <div className="border-l border-slate-200 pl-4">
                      <span className="text-[10px] text-slate-500 font-semibold block uppercase tracking-wider">
                        Stok Tersedia:
                      </span>
                      <span className="text-sm font-bold text-slate-800">
                        {product.stock.toLocaleString('id-ID')} {product.unit}
                      </span>
                    </div>
                  </div>

                  {/* Point-by-point Specs */}
                  <div>
                    <span className="text-xs font-bold text-slate-700 block mb-1">
                      Keterangan & Spesifikasi Teknis Produk:
                    </span>
                    <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                      {product.specs.slice(0, 3).map((spec, i) => (
                        <li key={i} className="leading-tight">{spec}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Purchase Configuration Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* 1. Quantity Input */}
                <div className="p-4 border border-slate-200 rounded-xl space-y-2 bg-white">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                    1. Jumlah Pesanan ({product.unit})
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min={1}
                      max={product.stock}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-36 px-3 py-2 border border-slate-300 rounded-xl font-bold text-base text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                    <span className="text-xs text-slate-500 font-medium">
                      Satuan: <strong>{product.unit}</strong>
                    </span>
                  </div>
                </div>

                {/* 2. Pola Pembelian (Loco, FOB, Franco, CIF) */}
                <div className="p-4 border border-slate-200 rounded-xl space-y-2 bg-white">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                      2. Pola Pembelian (Pilih Sistem Serah Terima)
                    </label>
                    <span className="text-[10px] text-blue-900 font-bold uppercase bg-blue-100 px-1.5 py-0.5 rounded">
                      {purchasePattern}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {(['Loco', 'FOB', 'Franco', 'CIF'] as PurchasePattern[]).map((pattern) => {
                      const pPricing = getProductPatternPrice(product, pattern, exchangeRate);
                      const isSelected = purchasePattern === pattern;
                      return (
                        <button
                          key={pattern}
                          type="button"
                          onClick={() => setPurchasePattern(pattern)}
                          className={`p-2 text-left rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'bg-blue-900 text-white border-blue-900 shadow-md ring-2 ring-blue-600/30'
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                          }`}
                        >
                          <div className="font-extrabold text-xs">{pattern.toUpperCase()}</div>
                          <div className={`text-[10px] font-mono mt-1 ${isSelected ? 'text-amber-300 font-bold' : 'text-slate-600 font-medium'}`}>
                            {formatIDR(pPricing.priceIDR)}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  
                  <p className="text-[11px] text-slate-600 pt-1 leading-tight">
                    <strong>{purchasePattern}:</strong> {patternInfo.description}
                  </p>
                </div>

                {/* 3. Mandatory Google Maps Coordinate for Franco */}
                {purchasePattern === 'Franco' && (
                  <div className="md:col-span-2 p-4 bg-amber-50 border-2 border-amber-300 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-amber-600" />
                        Link Maps Titik Koordinat Tujuan Barang (Wajib Khusus Franco) *
                      </label>
                      <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded">
                        MANDATORY
                      </span>
                    </div>
                    <div className="relative">
                      <input
                        type="url"
                        required
                        value={destinationCoordinateLink}
                        onChange={(e) => setDestinationCoordinateLink(e.target.value)}
                        placeholder="Contoh: https://maps.google.com/?q=-1.6157798,103.5221609 atau link pin Google Maps"
                        className="w-full px-3 py-2.5 rounded-lg border border-amber-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white text-slate-900 font-mono"
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-amber-800">
                      <span>Titik koordinat ini akan secara otomatis dicantumkan pada Kontrak Digital Pasal 4 dan Surat Jalan Armada.</span>
                      <button
                        type="button"
                        onClick={() => setDestinationCoordinateLink('https://maps.google.com/?q=-1.6157798,103.5221609')}
                        className="underline text-blue-800 hover:text-blue-950 font-semibold cursor-pointer shrink-0 ml-2"
                      >
                        Pakai Titik Contoh
                      </button>
                    </div>
                  </div>
                )}

                {/* 4. Sistem Pengiriman (Trucking, Tongkang, Mother Vessel) */}
                <div className="p-4 border border-slate-200 rounded-xl space-y-2 bg-white">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                    3. Sistem & Armada Pengiriman
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'Trucking', label: 'Trucking (Darat)', icon: Truck },
                      { id: 'Tongkang', label: 'Tongkang (Air)', icon: Ship },
                      { id: 'Mother Vessel', label: 'Mother Vessel (Laut)', icon: Anchor }
                    ].map((item) => {
                      const Icon = item.icon;
                      const isSelected = shippingMethod === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setShippingMethod(item.id as ShippingMethod)}
                          className={`p-2.5 rounded-xl border text-center flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                            isSelected
                              ? 'border-blue-700 bg-blue-50/70 text-blue-900 ring-2 ring-blue-600/20 font-bold'
                              : 'border-slate-200 hover:border-slate-300 text-slate-700'
                          }`}
                        >
                          <Icon className={`w-5 h-5 ${isSelected ? 'text-blue-700' : 'text-slate-500'}`} />
                          <span className="text-xs leading-tight">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 5. Sistem Perpajakan ECoretax */}
                <div className="p-4 border border-slate-200 rounded-xl space-y-2 bg-white">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Receipt className="w-4 h-4 text-blue-600" />
                      4. Sistem Perpajakan (ECoretax DJP)
                    </label>
                    {isWaterRoute && (
                      <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded">
                        Wajib Jalur Air
                      </span>
                    )}
                  </div>

                  {isWaterRoute ? (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-950 space-y-1">
                      <p className="font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 text-blue-700" />
                        Pengiriman Jalur Air (Tongkang / Mother Vessel) Wajib PPN 11% & PPh 22
                      </p>
                      <p className="text-[11px] text-slate-600">
                        Sesuai regulasi perpajakan komoditas perairan DJP ECoretax, faktur pajak resmi diterbitkan secara otomatis.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setEcoretaxChoice('Include')}
                        className={`p-2.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                          ecoretaxChoice === 'Include'
                            ? 'border-blue-700 bg-blue-50 text-blue-900 ring-2 ring-blue-600/20'
                            : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        Include PPN 11% (DJP)
                      </button>
                      <button
                        type="button"
                        onClick={() => setEcoretaxChoice('Exclude')}
                        className={`p-2.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                          ecoretaxChoice === 'Exclude'
                            ? 'border-blue-700 bg-blue-50 text-blue-900 ring-2 ring-blue-600/20'
                            : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        Exclude Pajak
                      </button>
                    </div>
                  )}
                </div>

                {/* 6. Sistem Pembayaran */}
                <div className="md:col-span-2 p-4 border border-slate-200 rounded-xl space-y-3 bg-white">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-blue-600" />
                      5. Pilihan Sistem Pembayaran Resmi
                    </label>
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Tersinkron Admin
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-2">
                    {availableMethods.map((method) => (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setPaymentMethod(method.code as PaymentMethod)}
                        className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer relative ${
                          paymentMethod === method.code
                            ? 'border-blue-800 bg-blue-900 text-white shadow-sm'
                            : 'border-slate-200 hover:border-slate-300 bg-slate-50 text-slate-700'
                        }`}
                      >
                        <span className="block font-mono">{method.code}</span>
                        {method.badge && (
                          <span className={`text-[8px] font-extrabold uppercase block mt-0.5 ${
                            paymentMethod === method.code ? 'text-amber-300' : 'text-blue-700'
                          }`}>
                            {method.badge}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Dynamic Payment Scheme Explanations & Bank Account Details */}
                  {activeMethodConfig && (
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl space-y-3 text-xs">
                      <div className="flex items-center justify-between font-bold text-blue-950">
                        <span className="text-sm">{activeMethodConfig.name}</span>
                        <span className="font-mono text-sm text-blue-900">
                          {activeMethodConfig.downPaymentPercent !== undefined && activeMethodConfig.downPaymentPercent > 0
                            ? `DP: ${formatIDR(dpIDR)} (${activeMethodConfig.downPaymentPercent}%)`
                            : 'Pelunasan Sesuai Dokumen'}
                        </span>
                      </div>

                      <p className="text-slate-600 text-[11px] leading-relaxed">
                        {activeMethodConfig.description}
                      </p>

                      {/* Milestone Summary if multi-stage */}
                      {(activeMethodConfig.progressPaymentPercent || 0) > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center mt-2">
                          <div className="p-2.5 bg-white rounded-lg border border-blue-200">
                            <span className="text-[10px] text-slate-500 font-bold block">
                              TAHAP 1 ({activeMethodConfig.downPaymentPercent}%)
                            </span>
                            <p className="font-mono font-bold text-blue-900">{formatIDR(dpIDR)}</p>
                            <span className="text-[9px] text-slate-600 block mt-0.5">
                              Saat Kontrak & PO Ditandatangani
                            </span>
                          </div>
                          <div className="p-2.5 bg-white rounded-lg border border-blue-200">
                            <span className="text-[10px] text-slate-500 font-bold block">
                              TAHAP 2 ({activeMethodConfig.progressPaymentPercent}%)
                            </span>
                            <p className="font-mono font-bold text-blue-900">{formatIDR(progressIDR)}</p>
                            <span className="text-[9px] text-slate-600 block mt-0.5">
                              Saat Progres Pemuatan Armada Dimulai
                            </span>
                          </div>
                          <div className="p-2.5 bg-white rounded-lg border border-blue-200">
                            <span className="text-[10px] text-slate-500 font-bold block">
                              TAHAP 3 ({activeMethodConfig.finalPaymentPercent}%)
                            </span>
                            <p className="font-mono font-bold text-blue-900">{formatIDR(finalIDR)}</p>
                            <span className="text-[9px] text-slate-600 block mt-0.5">
                              Setelah Tiba di Lokasi / Pelabuhan
                            </span>
                          </div>
                        </div>
                      )}

                      {/* QRIS Display if QRIS method */}
                      {activeMethodConfig.code === 'QRIS' && paymentSettings.qrisConfig && (
                        <div className="p-3 bg-white border border-slate-300 rounded-xl flex items-center gap-4 text-xs">
                          <div className="w-20 h-20 bg-white p-1 rounded-lg border border-slate-200 flex items-center justify-center shrink-0">
                            <img
                              src={paymentSettings.qrisConfig.qrisImageUrl}
                              alt="QRIS Barcode"
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block text-sm">
                              QRIS {paymentSettings.qrisConfig.merchantName}
                            </span>
                            <p className="text-slate-600 text-[11px] mt-0.5">
                              Pindai instan melalui aplikasi M-Banking atau E-Wallet. NMID: {paymentSettings.qrisConfig.nmid}.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Official Bank Account Destination */}
                      <div className="p-3 bg-white rounded-lg border border-blue-200 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                            Rekening Bank Tujuan Transfer Resmi PT. CAFTHEN INDO PROJECT:
                          </span>
                          <span className="text-[9px] bg-blue-100 text-blue-950 font-black px-1.5 py-0.2 rounded">
                            REKENING UTAMA
                          </span>
                        </div>
                        <p className="font-bold text-slate-900 text-sm">
                          {primaryBank.bankName} : <span className="font-mono text-blue-900 font-black">{primaryBank.accountNumber}</span>
                        </p>
                        <p className="text-xs text-slate-700">
                          Atas Nama: <strong>{primaryBank.accountHolder}</strong> ({primaryBank.branch || 'Pusat Jambi'})
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Incomplete Profile Alert Banner if user is logged in */}
              {currentUser && !userValidation.isComplete && (
                <div className="p-4 bg-amber-50 border-2 border-amber-400 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-amber-900 flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                      Data Profil & Dokumen Belum Lengkap ({userValidation.completionPercentage}% Selesai)
                    </span>
                    <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded">
                      WAJIB DILENGKAPI
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-700 leading-relaxed">
                    Untuk menjamin keabsahan hukum <strong>Surat Perjanjian Jual Beli (SPJB)</strong>, mohon lengkapi data profil dan upload berkas wajib (<strong>Foto Profil, KTP, NPWP</strong>).
                  </p>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {userValidation.missingRequiredLabels.map((lbl, idx) => (
                      <span key={idx} className="text-[10px] bg-white border border-amber-300 text-amber-800 px-2 py-0.5 rounded font-medium">
                        • {lbl}
                      </span>
                    ))}
                  </div>
                  {onNavigateToDashboard && (
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onNavigateToDashboard();
                        }}
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        Buka Dashboard & Lengkapi Sekarang
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Total Calculation Card */}
              <div className="p-5 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white rounded-2xl space-y-3">
                <div className="flex justify-between items-center text-xs text-slate-300">
                  <span>Subtotal ({quantity} {product.unit} @ {formatIDR(unitPriceIDR)}):</span>
                  <span className="font-mono font-bold text-white">{formatIDR(subtotalIDR)}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-300">
                  <span>Perpajakan ECoretax ({effectiveTaxChoice === 'Include' ? 'PPN 11%' : 'Exclude'}):</span>
                  <span className="font-mono font-bold text-amber-300">{formatIDR(ppnAmountIDR)}</span>
                </div>
                <div className="pt-3 border-t border-white/20 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                  <div>
                    <span className="text-xs text-slate-300 font-semibold block">TOTAL PEMBELIAN ({purchasePattern.toUpperCase()}):</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl sm:text-2xl font-black text-white font-mono">
                        {formatIDR(totalAmountIDR)}
                      </span>
                      <span className="text-sm font-semibold text-emerald-400 font-mono">
                        / {formatUSD(totalAmountUSD)}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleProceedToContract}
                    className="py-3 px-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 text-sm transition-all transform hover:scale-[1.02] cursor-pointer"
                  >
                    <FileCheck2 className="w-5 h-5 text-slate-950" />
                    Lanjutkan & Buat Kontrak Digital Otomatis
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>

      {/* Render Digital Contract Modal when proceeding */}
      {showContractModal && pendingContractOrder && (
        <DigitalContractModal
          isOpen={showContractModal}
          onClose={() => setShowContractModal(false)}
          contract={pendingContractOrder.contract}
          onSignComplete={handleContractSigned}
        />
      )}
    </>
  );
};
