import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DigitalSignatureSeal } from '../Common/DigitalSignatureSeal';
import { 
  X, 
  Printer, 
  CheckCircle, 
  ShieldCheck, 
  QrCode, 
  FileText, 
  Eraser, 
  Building2, 
  PenTool, 
  Calendar,
  Layers,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Eye,
  CheckCircle2,
  Lock,
  Scale,
  Truck,
  FileCheck,
  AlertCircle,
  Award,
  BookOpen,
  DollarSign,
  Shield,
  FileSpreadsheet
} from 'lucide-react';
import { DigitalContract } from '../../types';
import { formatIDR, formatUSD } from '../../utils/formatters';
import { StorageService } from '../../storage';
import { DEFAULT_CIP_LOGO } from '../../utils/logoPresets';

interface DigitalContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract: DigitalContract;
  onSignComplete?: (signatureDataUrl: string) => void;
  readOnly?: boolean;
}

export const DigitalContractModal: React.FC<DigitalContractModalProps> = ({
  isOpen,
  onClose,
  contract,
  onSignComplete,
  readOnly = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [signedDataUrl, setSignedDataUrl] = useState<string | undefined>(
    contract.secondParty.signatureDataUrl
  );
  const [isAgreed, setIsAgreed] = useState(contract.isSignedByBuyer);
  
  // Selected document page count (defaults to contract.totalPages or 5)
  const [selectedPageCount, setSelectedPageCount] = useState<number>(contract.totalPages || 5);
  const totalPages = Math.min(Math.max(selectedPageCount, 1), 10);

  // Page view navigation mode: 'all' | 1 .. totalPages
  const [activePageView, setActivePageView] = useState<'all' | number>('all');

  // Retrieve current active company profile & logo
  const company = StorageService.getCompanyProfile();
  const effectiveLogo = contract.firstParty.logoUrl || company.logoUrl || DEFAULT_CIP_LOGO;
  const effectiveCompanyName = contract.firstParty.company || company.companyName || 'PT. CAFTHEN INDO PROJECT';
  const effectiveAddress = contract.firstParty.address || company.address || 'Jl. Lintas Jambi Bulian Kota Kampus III, Mendalo Indah, Muaro Jambi';
  const effectivePhone = contract.firstParty.phone || company.phone || '+62831-49090950';
  const effectiveEmail = contract.firstParty.email || company.email || 'cafthen@gmail.com';
  const effectiveDirector = contract.firstParty.director || company.director || 'MASITHA.SH';
  const effectiveOwner = contract.firstParty.owner || company.owner || 'HENDRI PUTRA.S.Kom';

  useEffect(() => {
    if (contract.secondParty.signatureDataUrl) {
      setSignedDataUrl(contract.secondParty.signatureDataUrl);
      setIsAgreed(true);
    }
  }, [contract]);

  if (!isOpen) return null;

  // Signature Canvas Helpers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (readOnly || signedDataUrl) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || readOnly || signedDataUrl) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#0f2744';
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasDrawn(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    setSignedDataUrl(undefined);
  };

  const handleSaveSignature = () => {
    const targetSigPage = totalPages === 5 ? 5 : totalPages === 10 ? 9 : totalPages - 1;
    if (!hasDrawn && !signedDataUrl) {
      alert(`Silakan torehkan tanda tangan digital Anda pada kotak tanda tangan di Halaman ${targetSigPage} terlebih dahulu.`);
      return;
    }

    if (!isAgreed) {
      alert(`Anda wajib menyetujui seluruh klausul dan pasal kontrak perjanjian jual beli ${totalPages} halaman ini.`);
      return;
    }

    let sigUrl = signedDataUrl;
    if (!sigUrl && canvasRef.current) {
      sigUrl = canvasRef.current.toDataURL('image/png');
      setSignedDataUrl(sigUrl);
    }

    if (sigUrl && onSignComplete) {
      onSignComplete(sigUrl);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const qrValidationCode = contract.qrSignatureHash || `SHA256:CIP-${Date.now().toString(36).toUpperCase()}-LEGAL-SEAL-${totalPages}PAGE`;

  const getPageLabels = (count: number) => {
    if (count <= 5) {
      return [
        { num: 1, title: 'Hal 1: Kop & Komparisi' },
        { num: 2, title: 'Hal 2: Objek & Rincian Finansial' },
        { num: 3, title: 'Hal 3: Ketentuan Pembayaran & Incoterms' },
        { num: 4, title: 'Hal 4: Sanksi, Kahar & Hukum' },
        { num: 5, title: 'Hal 5: Tanda Tangan & Lampiran' }
      ].slice(0, count);
    } else if (count <= 7) {
      return [
        { num: 1, title: 'Hal 1: Kop & Komparisi' },
        { num: 2, title: 'Hal 2: Objek & Finansial' },
        { num: 3, title: 'Hal 3: Termin & Incoterms' },
        { num: 4, title: 'Hal 4: Surveyor & Retensi' },
        { num: 5, title: 'Hal 5: Sanksi & Kahar' },
        { num: 6, title: 'Hal 6: Tanda Tangan & QR' },
        { num: 7, title: 'Hal 7: Lampiran Teknis' }
      ].slice(0, count);
    } else {
      return [
        { num: 1, title: 'Hal 1: Kop & Komparisi' },
        { num: 2, title: 'Hal 2: Objek & Nilai SPJB' },
        { num: 3, title: 'Hal 3: Termin & ECoretax' },
        { num: 4, title: 'Hal 4: Pola Incoterms 2020' },
        { num: 5, title: 'Hal 5: Surveyor & Lab COA' },
        { num: 6, title: 'Hal 6: Hak & Hak Retensi' },
        { num: 7, title: 'Hal 7: Sanksi & Hangus DP' },
        { num: 8, title: 'Hal 8: Kahar & Tata Kelola' },
        { num: 9, title: 'Hal 9: Tanda Tangan & QR' },
        { num: 10, title: 'Hal 10: Lampiran Teknis' }
      ].slice(0, count);
    }
  };

  const pageLabels = getPageLabels(totalPages);

  // Helper for rendering mini header
  const renderMiniHeader = (pageNum: number, badgeText: string, badgeBg = 'bg-blue-100 text-blue-950') => (
    <div className="border-b-2 border-slate-900 pb-1.5 mb-2.5 flex items-center justify-between text-xs shrink-0">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-md border border-slate-300 p-0.5 flex items-center justify-center bg-white shrink-0 overflow-hidden shadow-2xs">
          <img
            src={effectiveLogo}
            alt={effectiveCompanyName}
            className="w-full h-full object-contain"
          />
        </div>
        <span className="font-black text-slate-950 text-xs sm:text-sm tracking-tight">{effectiveCompanyName}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="hidden sm:inline-block text-[10px] text-slate-500 font-mono">
          No. Reg: <strong className="text-slate-800">{contract.contractNumber}</strong>
        </span>
        <span className={`px-2 py-0.5 ${badgeBg} font-black rounded text-[9px] sm:text-[10px] font-mono uppercase tracking-wide border border-current/20`}>
          {badgeText}
        </span>
      </div>
    </div>
  );

  // Helper for rendering footer in pages
  const renderFooter = (pageNum: number, total: number = totalPages, extraNote?: string) => (
    <div className="pt-2 mt-auto border-t border-slate-300 flex items-center justify-between text-[9px] sm:text-[10px] text-slate-500 font-mono shrink-0">
      <div className="flex items-center gap-1.5 truncate">
        <ShieldCheck className="w-3.5 h-3.5 text-blue-800 shrink-0" />
        <span className="truncate">{effectiveCompanyName} • DOKUMEN SPJB ELEKTRONIK RESMI</span>
      </div>
      <div className="text-right font-bold text-slate-800 shrink-0 ml-2">
        Halaman {pageNum} dari {total} {extraNote ? `(${extraNote})` : pageNum === total ? '(Selesai)' : `(Bersambung ke Hal ${pageNum + 1})`}
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      <div className="print-contract-wrapper fixed inset-0 z-50 flex items-center justify-center p-1 sm:p-3 md:p-5 bg-slate-950/85 backdrop-blur-md overflow-y-auto print:p-0 print:bg-white print:static print:inset-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          className="print-contract-modal relative w-full max-w-7xl 2xl:max-w-[92vw] bg-slate-100 rounded-2xl shadow-2xl border border-slate-300 overflow-hidden my-auto flex flex-col h-full max-h-[96vh] print:max-h-none print:h-auto print:shadow-none print:border-none print:m-0 print:rounded-none print:bg-white"
        >
          {/* TOP ACTION BAR (Hidden on Print) */}
          <div className="bg-slate-900 text-white px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 print:hidden shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl border border-slate-700 bg-white p-1 flex items-center justify-center shadow-xs shrink-0 overflow-hidden">
                <img src={effectiveLogo} alt="CIP Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm sm:text-base tracking-tight">
                    DOKUMEN KONTRAK PERJANJIAN JUAL BELI & PENGADAAN (SPJB)
                  </h3>
                  <span className="px-2 py-0.5 bg-blue-800/80 text-blue-200 text-[10px] font-bold rounded-full border border-blue-700">
                    Format Resmi {totalPages} Halaman A4
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-mono mt-0.5">
                  No. Register: <span className="text-amber-300 font-bold">{contract.contractNumber}</span>
                </p>
              </div>
            </div>

            {/* View Mode Controls & Print Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="px-3.5 py-2 bg-blue-700 hover:bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                title={`Cetak atau Unduh Dokumen Lengkap (${totalPages} Halaman A4)`}
              >
                <Printer className="w-4 h-4" />
                <span className="hidden sm:inline">Cetak / Unduh PDF ({totalPages} Hal)</span>
                <span className="sm:hidden">Cetak PDF</span>
              </button>

              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors ml-1 cursor-pointer"
                title="Tutup Jendela"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* SECONDARY NAVIGATION BAR: PAGE SELECTOR & FORMAT TOGGLE (Hidden on Print) */}
          <div className="bg-slate-800 px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300 border-b border-slate-700 print:hidden shrink-0">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 shrink-0 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-blue-400" /> Navigasi:
              </span>
              <button
                onClick={() => setActivePageView('all')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                  activePageView === 'all'
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'hover:bg-slate-700 text-slate-300'
                }`}
              >
                Semua ({totalPages} Halaman)
              </button>
              {pageLabels.map((p) => (
                <button
                  key={p.num}
                  onClick={() => setActivePageView(p.num)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium shrink-0 transition-all cursor-pointer ${
                    activePageView === p.num
                      ? 'bg-blue-600 text-white font-bold shadow-xs'
                      : 'hover:bg-slate-700 text-slate-300'
                  }`}
                  title={p.title}
                >
                  Hal {p.num}
                </button>
              ))}
            </div>

            {/* PAGE COUNT FORMAT SELECTOR */}
            <div className="flex items-center gap-1.5 text-xs text-slate-300 bg-slate-900/80 px-2.5 py-1 rounded-xl border border-slate-700 shrink-0 font-mono">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Panjang Dokumen:</span>
              <button
                type="button"
                onClick={() => { setSelectedPageCount(5); setActivePageView('all'); }}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                  totalPages === 5 ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Format Standar SPJB 5 Halaman A4"
              >
                5 Hal
              </button>
              <button
                type="button"
                onClick={() => { setSelectedPageCount(7); setActivePageView('all'); }}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                  totalPages === 7 ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Format Lengkap SPJB 7 Halaman A4"
              >
                7 Hal
              </button>
              <button
                type="button"
                onClick={() => { setSelectedPageCount(10); setActivePageView('all'); }}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                  totalPages === 10 ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Format Ekstra SPJB 10 Halaman A4"
              >
                10 Hal (Max)
              </button>
            </div>
          </div>

          {/* DOCUMENT PAGES CONTAINER (Scrollable on Screen, Separated Pages on Print) */}
          <div className="print-contract-content p-3 sm:p-6 md:p-8 overflow-y-auto space-y-8 bg-slate-200/70 print:p-0 print:bg-white print:overflow-visible print:space-y-0">
            
            {/* ========================================================================= */}
            {/* HALAMAN 1 (PAGE 1) : KOP SURAT, KONSIDERANS & KOMPARISI PARA PIHAK        */}
            {/* ========================================================================= */}
            <div className={`print-page bg-white p-5 sm:p-8 rounded-2xl shadow-md border border-slate-300 mx-auto max-w-4xl text-slate-900 text-xs sm:text-sm leading-relaxed relative flex flex-col justify-between min-h-[940px] print:min-h-0 print:h-[262mm] print:max-h-[270mm] print:shadow-none print:border-none print:rounded-none print:p-0 print:max-w-none print:overflow-hidden ${
              activePageView === 'all' || activePageView === 1 ? 'flex' : 'hidden print:flex'
            }`}>
              <div className="space-y-3">
                
                {/* KOP SURAT RESMI PERUSAHAAN */}
                <div className="border-b-4 border-double border-slate-950 pb-2.5">
                  <div className="flex items-center justify-between gap-4">
                    <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-xl border border-slate-300 p-1 flex items-center justify-center shadow-xs overflow-hidden shrink-0 bg-white">
                      <img
                        src={effectiveLogo}
                        alt={effectiveCompanyName}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    <div className="text-center flex-1">
                      <h1 className="text-lg sm:text-2xl font-black tracking-tight text-slate-950 uppercase">
                        {effectiveCompanyName}
                      </h1>
                      <p className="text-[9px] sm:text-[11px] font-extrabold text-blue-900 tracking-wider mt-0.5 uppercase">
                        GENERAL TRADING • PROCUREMENT OF COMMODITIES & GOODS • CIVIL CONSTRUCTION SERVICES
                      </p>
                      <p className="text-[9px] sm:text-[10px] text-slate-600 mt-0.5 leading-snug">
                        {effectiveAddress}
                      </p>
                      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-0.5 text-[9px] sm:text-[10px] text-slate-700 font-medium mt-1">
                        <span>NIB: <strong>0220108891823</strong></span>
                        <span>•</span>
                        <span>NPWP: <strong>42.890.112.4-331.000</strong></span>
                        <span>•</span>
                        <span>Telp/WA: <strong>{effectivePhone}</strong></span>
                        <span>•</span>
                        <span>Email: <strong>{effectiveEmail}</strong></span>
                      </div>
                    </div>

                    <div className="hidden sm:flex flex-col items-center justify-center p-2 border border-blue-900/30 rounded-xl bg-blue-50/50 text-[9px] font-mono text-blue-950 font-bold w-22 text-center shrink-0">
                      <ShieldCheck className="w-5 h-5 text-blue-900 mb-0.5" />
                      <span>KONTRAK RESMI NASIONAL</span>
                    </div>
                  </div>
                </div>

                {/* JUDUL DOKUMEN & NOMOR REGISTER */}
                <div className="text-center my-1.5">
                  <h2 className="text-sm sm:text-base font-black text-slate-950 uppercase tracking-wide underline decoration-2 underline-offset-4">
                    SURAT PERJANJIAN JUAL BELI & PENGADAAN (SPJB)
                  </h2>
                  <p className="text-xs text-slate-700 font-mono font-bold mt-0.5">
                    NOMOR REGISTER: <span className="text-blue-950">{contract.contractNumber}</span>
                  </p>
                </div>

                {/* KONSIDERANS PEMBUKA HUKUM */}
                <p className="text-justify text-[11px] sm:text-xs leading-normal text-slate-800">
                  Pada hari ini, tanggal <strong>{contract.createdAt}</strong>, bertempat di Kantor Representatif Resmi <strong>{effectiveCompanyName}</strong>, telah dibuat, disepakati, dan ditandatangani Perjanjian Pengadaan & Jual Beli Komoditas/Jasa secara sah, mengikat, dan berkekuatan hukum penuh menurut <strong>Pasal 1320 & 1338 Kitab Undang-Undang Hukum Perdata (KUHPerdata)</strong>, <strong>Undang-Undang No. 11 Tahun 2008 jo. UU No. 1 Tahun 2024 tentang Informasi dan Transaksi Elektronik</strong>, <strong>Peraturan Pemerintah No. 71 Tahun 2019</strong>, serta <strong>Regulasi Perpajakan Nasional DJP ECoretax</strong>, oleh dan antara para pihak di bawah ini:
                </p>

                {/* KOMPARISI IDENTITAS PARA PIHAK */}
                <div className="space-y-2 pt-0.5">
                  <div className="p-2.5 sm:p-3 bg-slate-50 border border-slate-300 rounded-xl text-[11px] sm:text-xs space-y-1">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                      <span className="inline-block px-2 py-0.5 bg-blue-900 text-white font-black rounded text-[9px] sm:text-[10px] uppercase tracking-wider">
                        1. PIHAK PERTAMA (PENJUAL / PENYEDIA / SELLER)
                      </span>
                      <span className="text-[9px] sm:text-[10px] font-mono text-slate-600 font-bold">Badan Hukum Terdaftar</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-0.5 pt-0.5 text-slate-800">
                      <p><strong>Nama Entitas:</strong> {effectiveCompanyName}</p>
                      <p><strong>Direktur Utama:</strong> {effectiveDirector}</p>
                      <p><strong>Komisaris / Owner:</strong> {effectiveOwner}</p>
                      <p><strong>NIB Perusahaan:</strong> 0220108891823</p>
                      <p><strong>NPWP:</strong> 42.890.112.4-331.000</p>
                      <p><strong>Alamat:</strong> {effectiveAddress}</p>
                      <p><strong>Kontak Resmi:</strong> {effectivePhone}</p>
                      <p><strong>Email:</strong> {effectiveEmail}</p>
                    </div>
                    <p className="text-[10px] sm:text-[11px] text-slate-600 italic pt-0.5 border-t border-slate-200">
                      Dalam hal ini bertindak untuk dan atas nama <strong>{effectiveCompanyName}</strong> selaku pemilik dan penyedia resmi, selanjutnya disebut sebagai <strong>PIHAK PERTAMA</strong>.
                    </p>
                  </div>

                  <div className="p-2.5 sm:p-3 bg-slate-50 border border-slate-300 rounded-xl text-[11px] sm:text-xs space-y-1">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                      <span className="inline-block px-2 py-0.5 bg-slate-800 text-white font-black rounded text-[9px] sm:text-[10px] uppercase tracking-wider">
                        2. PIHAK KEDUA (PEMBELI / PENGGUNA JASA / BUYER)
                      </span>
                      <span className="text-[9px] sm:text-[10px] font-mono text-slate-600 font-bold">{contract.secondParty.userType}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-0.5 pt-0.5 text-slate-800">
                      <p><strong>Nama Lengkap:</strong> {contract.secondParty.name}</p>
                      {contract.secondParty.companyName && (
                        <p><strong>Perusahaan / Instansi:</strong> {contract.secondParty.companyName}</p>
                      )}
                      <p><strong>KTP / NIK / Paspor:</strong> {contract.secondParty.idNumber}</p>
                      <p><strong>Alamat Domisili:</strong> {contract.secondParty.address}</p>
                      <p><strong>Nomor Kontak:</strong> {contract.secondParty.phone}</p>
                      <p><strong>Email Resmi:</strong> {contract.secondParty.email}</p>
                    </div>
                    <p className="text-[10px] sm:text-[11px] text-slate-600 italic pt-0.5 border-t border-slate-200">
                      Dalam hal ini bertindak atas nama pribadi dan/atau instansinya secara sah dengan kapasitas hukum penuh, selanjutnya disebut sebagai <strong>PIHAK KEDUA</strong>.
                    </p>
                  </div>
                </div>

                <p className="text-justify text-[11px] sm:text-xs text-slate-700 leading-normal pt-0.5">
                  PIHAK PERTAMA dan PIHAK KEDUA secara bersama-sama selanjutnya disebut sebagai <strong>"PARA PIHAK"</strong>. PARA PIHAK dengan ini sepakat untuk saling mengikatkan diri dalam Surat Perjanjian Jual Beli dan Pengadaan ini dengan syarat-syarat dan ketentuan-ketentuan sebagaimana tercantum dalam 10 (sepuluh) halaman dokumen ini.
                </p>
              </div>

              {/* FOOTER HALAMAN 1 */}
              {renderFooter(1)}
            </div>

            {/* ========================================================================= */}
            {/* HALAMAN 2 (PAGE 2) : OBJEK PENGADAAN & TABEL RINCIAN FINANSIAL LENGKAP   */}
            {/* ========================================================================= */}
            <div className={`print-page bg-white p-5 sm:p-8 rounded-2xl shadow-md border border-slate-300 mx-auto max-w-4xl text-slate-900 text-xs sm:text-sm leading-relaxed relative flex flex-col justify-between min-h-[940px] print:min-h-0 print:h-[262mm] print:max-h-[270mm] print:shadow-none print:border-none print:rounded-none print:p-0 print:max-w-none print:overflow-hidden ${
              activePageView === 'all' || activePageView === 2 ? 'flex' : 'hidden print:flex'
            }`}>
              <div className="space-y-3">
                {renderMiniHeader(2, 'LEMBAR SPJB : HALAMAN 2 DARI 10')}

                <div className="space-y-1">
                  <h4 className="font-black text-slate-950 uppercase text-xs sm:text-[13px]">
                    PASAL 1 : DEFINISI DAN TERMINOLOGI OPERASIONAL PERJANJIAN
                  </h4>
                  <p className="text-slate-700 text-justify text-xs leading-normal">
                    Kecuali secara tegas dinyatakan lain dalam konteks Perjanjian ini, istilah-istilah berikut memiliki pengertian sebagai berikut:
                  </p>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-700 text-xs pl-1">
                    <li><strong>"SPJB"</strong> adalah Surat Perjanjian Jual Beli dan Pengadaan Komoditas beserta seluruh lampiran dan adendum perubahannya.</li>
                    <li><strong>"Komoditas"</strong> adalah barang dagangan berupa hasil tambang, perkebunan, material galian, atau produk industri yang menjadi objek perjanjian.</li>
                    <li><strong>"Titik Serah (Delivery Point)"</strong> adalah stockpile muat, pelabuhan muat (jetty), atau titik koordinat bongkar yang disepakati.</li>
                    <li><strong>"COA & COW"</strong> adalah <em>Certificate of Analysis</em> (Sertifikat Kualitas Laboratorium) dan <em>Certificate of Weight</em> (Sertifikat Timbangan Resmi).</li>
                    <li><strong>"Laytime & Demurrage"</strong> adalah batas waktu wajar proses pemuatan/pembongkaran muatan dan denda kompensasi keterlambatan waktu tunggu armada.</li>
                  </ul>
                </div>

                <div className="space-y-1 pt-0.5">
                  <h4 className="font-black text-slate-950 uppercase text-xs sm:text-[13px]">
                    PASAL 2 : OBJEK PERJANJIAN, KUANTITAS & SPESIFIKASI MUTU
                  </h4>
                  <p className="text-slate-700 text-justify text-xs leading-normal">
                    PIHAK PERTAMA setuju menjual dan menyerahkan, dan PIHAK KEDUA setuju membeli dan menerima objek pengadaan berupa <strong>{contract.orderDetails.productName}</strong> dengan volume sebesar <strong>{contract.orderDetails.quantity.toLocaleString('id-ID')} {contract.orderDetails.unit}</strong> sesuai rincian kuantitatif dan kualitatif berikut:
                  </p>
                </div>

                {/* TABEL RINCIAN OBJEK PENGADAAN & FINANSIAL */}
                <div className="border border-slate-300 rounded-xl overflow-hidden text-xs">
                  <div className="bg-slate-100 px-3 py-1 font-black text-slate-900 border-b border-slate-300 flex items-center justify-between">
                    <span className="uppercase text-[10px] sm:text-[11px]">TABEL 1: RINCIAN OBJEK TRANSAKSI, SPESIFIKASI & STRUKTUR HARGA</span>
                    <span className="text-[9px] bg-blue-100 text-blue-900 px-1.5 py-0.5 rounded font-mono font-bold">
                      ECoretax Integrated
                    </span>
                  </div>

                  <div className="p-3 space-y-1.5">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg">
                        <span className="text-slate-500 text-[9px] font-bold block">NAMA KOMODITAS / JASA:</span>
                        <p className="font-bold text-slate-950 mt-0.5 text-[11px]">{contract.orderDetails.productName}</p>
                      </div>
                      <div className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg">
                        <span className="text-slate-500 text-[9px] font-bold block">VOLUME / KUANTITAS:</span>
                        <p className="font-bold text-slate-950 mt-0.5 text-[11px]">
                          {contract.orderDetails.quantity.toLocaleString('id-ID')} {contract.orderDetails.unit}
                        </p>
                      </div>
                      <div className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg">
                        <span className="text-slate-500 text-[9px] font-bold block">POLA PENGADAAN:</span>
                        <p className="font-bold text-blue-900 uppercase mt-0.5 text-[11px]">{contract.orderDetails.purchasePattern}</p>
                      </div>
                      <div className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg">
                        <span className="text-slate-500 text-[9px] font-bold block">MODA LOGISTIK ARMADA:</span>
                        <p className="font-bold text-blue-900 mt-0.5 text-[11px]">{contract.orderDetails.shippingMethod}</p>
                      </div>
                    </div>

                    {contract.orderDetails.destinationCoordinateLink && (
                      <div className="p-1.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-950 flex items-center gap-2 text-[10px]">
                        <MapPin className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                        <span>
                          <strong>Titik Koordinat / Lokasi Bongkar Tujuan:</strong> {contract.orderDetails.destinationCoordinateLink}
                        </span>
                      </div>
                    )}

                    <div className="pt-1.5 border-t border-slate-200 space-y-0.5 text-xs">
                      <div className="flex justify-between text-slate-700">
                        <span>Harga Satuan Dasar (Unit Price IDR / USD):</span>
                        <span className="font-mono font-semibold">
                          {formatIDR(contract.orderDetails.unitPriceIDR)} / {contract.orderDetails.unit} ({formatUSD(contract.orderDetails.unitPriceUSD)})
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-700">
                        <span>Subtotal Nilai Komoditas:</span>
                        <span className="font-mono font-semibold">{formatIDR(contract.orderDetails.subtotalIDR)}</span>
                      </div>
                      <div className="flex justify-between text-slate-700">
                        <span>Kewajiban Perpajakan ({contract.orderDetails.taxType}):</span>
                        <span className="font-mono font-semibold">{formatIDR(contract.orderDetails.taxAmountIDR)}</span>
                      </div>
                      <div className="flex justify-between text-xs sm:text-sm font-black text-slate-950 pt-1 border-t border-slate-300">
                        <span className="uppercase">TOTAL NILAI KONTRAK KESELURUHAN (IDR / USD):</span>
                        <span className="font-mono text-blue-950 text-sm sm:text-base">
                          {formatIDR(contract.orderDetails.totalAmountIDR)} <span className="text-xs text-slate-600">({formatUSD(contract.orderDetails.totalAmountUSD)})</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-justify text-xs text-slate-700 leading-normal pt-0.5">
                  Batas toleransi penimbangan (*weight allowance tolerance*) pada saat serah terima di titik tujuan disepakati maksimal sebesar <strong>0.5% (nol koma lima persen)</strong> dari total muatan timbangan asal sebagai kompensasi wajar penyusutan alamiah dalam perjalanan logistik.
                </p>
              </div>

              {/* FOOTER HALAMAN 2 */}
              {renderFooter(2)}
            </div>

            {/* ========================================================================= */}
            {/* HALAMAN 3 (PAGE 3) : SKEMA TERMIN PEMBAYARAN, REKENING RESMI & ECORETAX */}
            {/* ========================================================================= */}
            <div className={`print-page bg-white p-5 sm:p-8 rounded-2xl shadow-md border border-slate-300 mx-auto max-w-4xl text-slate-900 text-xs sm:text-sm leading-relaxed relative flex flex-col justify-between min-h-[940px] print:min-h-0 print:h-[262mm] print:max-h-[270mm] print:shadow-none print:border-none print:rounded-none print:p-0 print:max-w-none print:overflow-hidden ${
              activePageView === 'all' || activePageView === 3 ? 'flex' : 'hidden print:flex'
            }`}>
              <div className="space-y-3">
                {renderMiniHeader(3, 'LEMBAR SPJB : HALAMAN 3 DARI 10')}

                <div className="space-y-1">
                  <h4 className="font-black text-slate-950 uppercase text-xs sm:text-[13px]">
                    PASAL 3 : NILAI PERIKATAN FINANSIAL & KLAUSUL HARGA TETAP (FIXED AND FIRM)
                  </h4>
                  <p className="text-slate-700 text-justify text-xs leading-normal">
                    Nilai Perjanjian yang disepakati oleh PARA PIHAK bersifat <strong>Fixed and Firm (Tetap dan Mengikat)</strong> selama masa berlaku kontrak ini, dan tidak dipengaruhi oleh fluktuasi nilai tukar valuta asing atau perubahan harga komoditas di pasar internasional/domestik.
                  </p>
                </div>

                <div className="space-y-1 pt-0.5">
                  <h4 className="font-black text-slate-950 uppercase text-xs sm:text-[13px]">
                    PASAL 4 : TATA CARA PEMBAYARAN, TERMIN TRANSAKSI & REKENING RESMI
                  </h4>
                  <p className="text-slate-700 text-justify text-xs leading-normal">
                    Pembayaran dari PIHAK KEDUA kepada PIHAK PERTAMA wajib disalurkan melalui transfer bank resmi (*wire bank transfer*) atau sistem perbankan terdaftar ke rekening koran resmi milik <strong>{effectiveCompanyName}</strong>:
                  </p>

                  <div className="p-3 bg-slate-50 border border-slate-300 rounded-xl space-y-1 text-xs">
                    <div className="flex items-center gap-2 font-bold text-slate-950 border-b border-slate-200 pb-1">
                      <Building2 className="w-4 h-4 text-blue-900" />
                      <span>REKENING KORAN PERUSAHAAN (ESCROW & VENDOR SETTLEMENT):</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                      <div className="p-2 bg-white border border-slate-200 rounded-lg">
                        <span className="text-slate-500 font-bold block text-[10px]">BANK UTAMA:</span>
                        <p className="font-bold text-slate-900">BANK MANDIRI (PERSERO) TBK</p>
                        <p className="text-blue-950 font-bold">No. Rek: 110-00-1889182-3</p>
                        <p className="text-[10px] text-slate-600">A.N: {effectiveCompanyName}</p>
                      </div>
                      <div className="p-2 bg-white border border-slate-200 rounded-lg">
                        <span className="text-slate-500 font-bold block text-[10px]">BANK KEDUA (OPSIONAL):</span>
                        <p className="font-bold text-slate-900">BANK CENTRAL ASIA (BCA)</p>
                        <p className="text-blue-950 font-bold">No. Rek: 058-991823-1</p>
                        <p className="text-[10px] text-slate-600">A.N: {effectiveCompanyName}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-1 pt-0.5">
                  <h4 className="font-black text-slate-950 uppercase text-xs sm:text-[13px]">
                    PASAL 5 : KEWAJIBAN PERPAJAKAN & FAKTUR ELEKTRONIK (ECORETAX DJP)
                  </h4>
                  <p className="text-slate-700 text-justify text-xs leading-normal">
                    Setiap pembayaran akan diterbitkan Faktur Pajak Elektronik (e-Faktur) dan Bukti Potong PPh resmi melalui integrasi modul <strong>ECoretax Direktorat Jenderal Pajak (DJP)</strong>. PIHAK PERTAMA menjamin bahwa seluruh kewajiban pajak dilaporkan secara transparan dan akuntabel sesuai peraturan perpajakan Republik Indonesia.
                  </p>
                </div>
              </div>

              {/* FOOTER HALAMAN 3 */}
              {renderFooter(3)}
            </div>

            {/* ========================================================================= */}
            {/* HALAMAN 4 (PAGE 4) : POLA PENGADAAN INCOTERMS 2020 & LOGISTIK DISTRIBUSI  */}
            {/* ========================================================================= */}
            <div className={`print-page bg-white p-5 sm:p-8 rounded-2xl shadow-md border border-slate-300 mx-auto max-w-4xl text-slate-900 text-xs sm:text-sm leading-relaxed relative flex flex-col justify-between min-h-[940px] print:min-h-0 print:h-[262mm] print:max-h-[270mm] print:shadow-none print:border-none print:rounded-none print:p-0 print:max-w-none print:overflow-hidden ${
              activePageView === 'all' || activePageView === 4 ? 'flex' : 'hidden print:flex'
            }`}>
              <div className="space-y-3">
                {renderMiniHeader(4, 'LEMBAR SPJB : HALAMAN 4 DARI 10')}

                <div className="space-y-1">
                  <h4 className="font-black text-slate-950 uppercase text-xs sm:text-[13px]">
                    PASAL 6 : POLA PENGADAAN INCOTERMS 2020 & TITIK PERALIHAN RISIKO
                  </h4>
                  <p className="text-slate-700 text-justify text-xs leading-normal">
                    Pengadaan komoditas ini dilaksanakan berdasarkan klausul <strong>Incoterms 2020</strong> yang dipilih pada Surat Pesanan: <strong>{contract.orderDetails.purchasePattern.toUpperCase()}</strong>. Batas tanggung jawab dan risiko beralih dengan ketentuan baku:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                    <div className="p-2.5 bg-slate-50 border border-slate-300 rounded-xl space-y-0.5">
                      <span className="font-bold text-blue-950 block">A. POLA LOCO (STOCKPILE ASAL / EX-WORKS):</span>
                      <p className="text-slate-700 text-[11px] leading-snug">
                        Barang diserahkan di atas stockpile/gudang PIHAK PERTAMA. Biaya muat ke armada dan seluruh risiko perjalanan menjadi beban sepenuhnya PIHAK KEDUA.
                      </p>
                    </div>
                    <div className="p-2.5 bg-slate-50 border border-slate-300 rounded-xl space-y-0.5">
                      <span className="font-bold text-blue-950 block">B. POLA FOB (FREE ON BOARD / JETTY BARGE):</span>
                      <p className="text-slate-700 text-[11px] leading-snug">
                        PIHAK PERTAMA bertanggung jawab sampai dengan pemuatan komoditas selesai di atas tongkang (*barge*) di pelabuhan muat. Risiko beralih saat komoditas melintasi bibir kapal (*ship's rail*).
                      </p>
                    </div>
                    <div className="p-2.5 bg-slate-50 border border-slate-300 rounded-xl space-y-0.5">
                      <span className="font-bold text-blue-950 block">C. POLA FRANCO (DELIVERED AT PLACE / SITE):</span>
                      <p className="text-slate-700 text-[11px] leading-snug">
                        PIHAK PERTAMA menanggung biaya angkutan sampai dengan armada tiba di titik koordinat bongkar PIHAK KEDUA. Risiko beralih saat serah terima sebelum pembongkaran.
                      </p>
                    </div>
                    <div className="p-2.5 bg-slate-50 border border-slate-300 rounded-xl space-y-0.5">
                      <span className="font-bold text-blue-950 block">D. POLA CIF (COST, INSURANCE, AND FREIGHT):</span>
                      <p className="text-slate-700 text-[11px] leading-snug">
                        PIHAK PERTAMA menanggung biaya pengapalan logistik dan premi asuransi maritim hingga pelabuhan tujuan bongkar yang ditetapkan.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-1 pt-0.5">
                  <h4 className="font-black text-slate-950 uppercase text-xs sm:text-[13px]">
                    PASAL 7 : STANDAR KELAYAKAN ARMADA & LEGALITAS LOGISTIK
                  </h4>
                  <p className="text-slate-700 text-justify text-xs leading-normal">
                    Penyedia jasa angkutan logistik (truk/tongkang/vessel) wajib memiliki izin operasional resmi, Surat Izin Usaha Perusahaan Angkutan Laut (SIUPAL) atau Izin Angkutan Darat Kemenhub, serta memenuhi standar Keselamatan dan Kesehatan Kerja Lingkungan (K3L).
                  </p>
                </div>
              </div>

              {/* FOOTER HALAMAN 4 */}
              {renderFooter(4)}
            </div>

            {/* ========================================================================= */}
            {/* HALAMAN 5 (PAGE 5) : CONDITIONAL FINAL SIGNATURE PAGE (5-PAGE MODE) OR QUALITY CONTROL (10-PAGE MODE) */}
            {/* ========================================================================= */}
            {totalPages <= 5 ? (
              /* HALAMAN 5 (FINAL PAGE UNTUK FORMAT 5 HALAMAN) */
              <div className={`print-page bg-white p-5 sm:p-8 rounded-2xl shadow-md border border-slate-300 mx-auto max-w-4xl text-slate-900 text-xs sm:text-sm leading-relaxed relative flex flex-col justify-between min-h-[940px] print:min-h-0 print:h-[262mm] print:max-h-[270mm] print:shadow-none print:border-none print:rounded-none print:p-0 print:max-w-none print:overflow-hidden ${
                activePageView === 'all' || activePageView === 5 ? 'flex' : 'hidden print:flex'
              }`}>
                <div className="space-y-2.5">
                  {renderMiniHeader(5, 'LEMBAR SPJB : HALAMAN 5 DARI 5 (PENGESAHAN & AKHIR)', 'bg-amber-100 text-amber-950')}

                  <div className="space-y-1">
                    <h4 className="font-black text-slate-950 uppercase text-xs sm:text-[13px]">
                      PASAL 7 : SURVEYOR INDEPENDEN, SANKSI DENDA & DOMISILI HUKUM
                    </h4>
                    <p className="text-slate-700 text-justify text-xs leading-normal">
                      Pemeriksaan mutu dilakukan oleh Surveyor Independen (Sucofindo/Carsurin) dengan hasil COA/COW bersifat final. Keterlambatan pembayaran dikenakan denda 1‰/hari (max 5%). Pembatalan sepihak mengakibatkan DP hangus. Segala perselisihan diselesaikan di PN Jambi atau BANI.
                    </p>
                  </div>

                  <div className="space-y-1 pt-0.5 border-t border-slate-200">
                    <h4 className="font-black text-slate-950 uppercase text-xs sm:text-[13px]">
                      PASAL 8 : KEABSAHAN TANDA TANGAN ELEKTRONIK & SEGEL QR (UU ITE)
                    </h4>
                    <p className="text-slate-700 text-justify text-xs leading-normal">
                      Tanda tangan digital pada aplikasi ini beserta Barcode Segel QR {effectiveCompanyName} sah & mengikat secara otentik menurut Pasal 5, 6, 11 UU ITE No. 1/2024.
                    </p>
                  </div>

                  <p className="text-[11px] text-center text-slate-600 font-semibold pt-0.5 border-t border-slate-200">
                    Demikian Perjanjian ini dibuat secara elektronik terenkripsi yang sah, mengikat, dan memiliki kekuatan hukum penuh sejak ditandatangani.
                  </p>

                  {/* LEMBAR TANDA TANGAN DIGITAL & SEGEL QR PARA PIHAK */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start pt-0.5">
                    
                    {/* PIHAK PERTAMA SIGNATURE (PENJUAL WITH QR SEAL) */}
                    <div className="p-3 bg-slate-50 border border-slate-300 rounded-xl text-center flex flex-col items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-slate-800 uppercase block mb-0.5">
                          PIHAK PERTAMA (PENJUAL)
                        </span>
                        <p className="text-xs text-blue-950 font-black">{effectiveCompanyName}</p>
                      </div>

                      {/* Official QR Code Seal & Authentic Digital Signature */}
                      <div className="my-1.5 w-full flex flex-col items-center">
                        <DigitalSignatureSeal
                          documentData={{
                            documentId: contract.contractNumber,
                            documentTitle: `SURAT PERJANJIAN JUAL BELI - ${contract.orderDetails?.productName || ''}`,
                            documentType: 'Surat Perjanjian Jual Beli (SPJB)',
                            partyFirst: effectiveCompanyName,
                            partySecond: contract.secondParty.companyName || contract.secondParty.name,
                            issueDate: contract.createdAt,
                            status: 'TERVERIFIKASI SAH (INKRACHT 100%)',
                            hashSha256: qrValidationCode,
                            signerType: 'director',
                            productName: contract.orderDetails?.productName,
                            quantity: contract.orderDetails?.quantity,
                            unit: contract.orderDetails?.unit,
                            totalPriceIDR: contract.orderDetails?.totalAmountIDR,
                            totalPriceUSD: contract.orderDetails?.totalAmountUSD,
                            purchasePattern: contract.orderDetails?.purchasePattern,
                            paymentTermScheme: contract.orderDetails?.paymentMethod,
                            deliveryTermLocation: contract.orderDetails?.destinationCoordinateLink || 'Sesuai Lokasi Terdaftar Konsumen',
                            contractBriefSummary: `Perikatan Jual Beli & Pengadaan ${contract.orderDetails?.productName || ''} sejumlah ${(contract.orderDetails?.quantity || 0).toLocaleString('id-ID')} ${contract.orderDetails?.unit || ''} berdasarkan skema ${contract.orderDetails?.purchasePattern || ''} dengan total transaksi Rp ${(contract.orderDetails?.totalAmountIDR || 0).toLocaleString('id-ID')} ($${(contract.orderDetails?.totalAmountUSD || 0).toLocaleString('en-US')}) antara Pihak I (${effectiveCompanyName}) dan Pihak II (${contract.secondParty.companyName || contract.secondParty.name}).`
                          }}
                          size="sm"
                          signerLabel="TTD QRIS DIGITAL DIREKTUR"
                          signerType="director"
                        />
                      </div>

                      <div>
                        <p className="font-black text-xs text-slate-950 underline decoration-1 underline-offset-2">
                          {effectiveDirector}
                        </p>
                        <p className="text-[10px] text-slate-600">Direktur Utama</p>
                        <p className="font-semibold text-[10px] text-blue-900">Owner: {effectiveOwner}</p>
                      </div>
                    </div>

                    {/* PIHAK KEDUA SIGNATURE (PEMBELI) */}
                    <div className="p-3 bg-slate-50 border border-slate-300 rounded-xl text-center flex flex-col items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-slate-800 uppercase block mb-0.5">
                          PIHAK KEDUA (PEMBELI)
                        </span>
                        <p className="text-xs text-slate-950 font-black">
                          {contract.secondParty.companyName || contract.secondParty.name}
                        </p>
                      </div>

                      {signedDataUrl ? (
                        <div className="my-1.5 w-full flex flex-col items-center">
                          <DigitalSignatureSeal
                            documentData={{
                              documentId: contract.contractNumber,
                              documentTitle: `SURAT PERJANJIAN JUAL BELI - ${contract.orderDetails?.productName || ''}`,
                              documentType: 'Surat Perjanjian Jual Beli (SPJB)',
                              partyFirst: effectiveCompanyName,
                              partySecond: contract.secondParty.companyName || contract.secondParty.name,
                              issueDate: contract.secondParty.signedAt || contract.effectiveDate || contract.createdAt,
                              status: 'TERVERIFIKASI SAH (INKRACHT 100%)',
                              hashSha256: qrValidationCode,
                              signerType: 'buyer',
                              productName: contract.orderDetails?.productName,
                              quantity: contract.orderDetails?.quantity,
                              unit: contract.orderDetails?.unit,
                              totalPriceIDR: contract.orderDetails?.totalAmountIDR,
                              totalPriceUSD: contract.orderDetails?.totalAmountUSD,
                              purchasePattern: contract.orderDetails?.purchasePattern,
                              paymentTermScheme: contract.orderDetails?.paymentMethod,
                              deliveryTermLocation: contract.orderDetails?.destinationCoordinateLink || 'Sesuai Lokasi Terdaftar Konsumen',
                              contractBriefSummary: `Perikatan Jual Beli & Pengadaan ${contract.orderDetails?.productName || ''} sejumlah ${(contract.orderDetails?.quantity || 0).toLocaleString('id-ID')} ${contract.orderDetails?.unit || ''} berdasarkan skema ${contract.orderDetails?.purchasePattern || ''} dengan total transaksi Rp ${(contract.orderDetails?.totalAmountIDR || 0).toLocaleString('id-ID')} ($${(contract.orderDetails?.totalAmountUSD || 0).toLocaleString('en-US')}) antara Pihak I (${effectiveCompanyName}) dan Pihak II (${contract.secondParty.companyName || contract.secondParty.name}).`
                            }}
                            size="sm"
                            customSignatureImgUrl={signedDataUrl}
                            signerLabel="TTD QRIS DIGITAL PEMBELI"
                            signerType="buyer"
                          />
                        </div>
                      ) : readOnly ? (
                        <div className="my-1.5 h-14 w-full max-w-[190px] flex items-center justify-center border-2 border-dashed border-slate-300 rounded-xl text-slate-400 text-[10px] bg-white">
                          Menunggu Tanda Tangan Pembeli
                        </div>
                      ) : (
                        <>
                          <div className="my-1 w-full flex flex-col items-center print:hidden">
                            <div className="relative border-2 border-dashed border-blue-400 bg-white rounded-xl p-1 w-full max-w-[220px]">
                              <canvas
                                ref={canvasRef}
                                width={220}
                                height={70}
                                onMouseDown={startDrawing}
                                onMouseMove={draw}
                                onMouseUp={stopDrawing}
                                onMouseLeave={stopDrawing}
                                onTouchStart={startDrawing}
                                onTouchMove={draw}
                                onTouchEnd={stopDrawing}
                                className="w-full h-14 touch-none cursor-crosshair bg-white rounded-lg"
                              />
                              {!hasDrawn && (
                                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-slate-400 text-[10px]">
                                  <PenTool className="w-3 h-3 mb-0.5" />
                                  <span>Torehkan Tanda Tangan di Sini</span>
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2 mt-1">
                              <button
                                type="button"
                                onClick={clearCanvas}
                                className="px-2 py-0.5 text-[9px] text-rose-600 hover:bg-rose-50 rounded flex items-center gap-1 cursor-pointer font-bold"
                              >
                                <Eraser className="w-3 h-3" /> Hapus Goresan
                              </button>
                            </div>
                          </div>

                          <div className="hidden print:flex flex-col items-center justify-center my-2 w-full max-w-[190px] h-14 border-b-2 border-dashed border-slate-400">
                            <span className="text-[8px] text-slate-400 italic mb-auto">Materai / Tanda Tangan Sah</span>
                          </div>
                        </>
                      )}

                      <div>
                        <p className="font-black text-xs text-slate-950 underline decoration-1 underline-offset-2">
                          {contract.secondParty.name}
                        </p>
                        <p className="text-[10px] text-slate-600">{contract.secondParty.idNumber}</p>
                        <p className="font-semibold text-[10px] text-slate-700">{contract.secondParty.userType}</p>
                      </div>
                    </div>
                  </div>

                  {/* ENCRYPTED LEGAL CHECKSUM & ECORETAX SUMMARY BOX */}
                  <div className="p-2 bg-slate-100 border border-slate-300 rounded-xl flex flex-wrap items-center justify-between gap-2 text-[9px] text-slate-600 font-mono">
                    <div className="flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-blue-900 shrink-0" />
                      <span>HASH SHA-256: <strong>{qrValidationCode}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>STATUS: INKRACHT & ECORETAX DJP VERIFIED</span>
                    </div>
                  </div>
                </div>

                {/* FOOTER HALAMAN 5 */}
                {renderFooter(5, 5)}
              </div>
            ) : (
              /* HALAMAN 5 (PAGE 5) UNTUK FORMAT > 5 HALAMAN */
              <div className={`print-page bg-white p-5 sm:p-8 rounded-2xl shadow-md border border-slate-300 mx-auto max-w-4xl text-slate-900 text-xs sm:text-sm leading-relaxed relative flex flex-col justify-between min-h-[940px] print:min-h-0 print:h-[262mm] print:max-h-[270mm] print:shadow-none print:border-none print:rounded-none print:p-0 print:max-w-none print:overflow-hidden ${
                activePageView === 'all' || activePageView === 5 ? 'flex' : 'hidden print:flex'
              }`}>
                <div className="space-y-3">
                  {renderMiniHeader(5, `LEMBAR SPJB : HALAMAN 5 DARI ${totalPages}`)}

                  <div className="space-y-1">
                    <h4 className="font-black text-slate-950 uppercase text-xs sm:text-[13px]">
                      PASAL 8 : PENUNJUKAN SURVEYOR INDEPENDEN & PENGAMBILAN SAMPEL
                    </h4>
                    <p className="text-slate-700 text-justify text-xs leading-normal">
                      Untuk menjamin keaslian dan mutu komoditas, PARA PIHAK sepakat menunjuk Lembaga Surveyor Independen Terakreditasi (seperti <strong>PT. Sucofindo</strong>, <strong>PT. Carsurin</strong>, atau <strong>PT. Surveyor Indonesia</strong>). Pengambilan sampel uji dilakukan bersama di titik muat dengan metode representatif standar ASTM / ISO / SNI.
                    </p>
                  </div>

                  <div className="space-y-1 pt-0.5">
                    <h4 className="font-black text-slate-950 uppercase text-xs sm:text-[13px]">
                      PASAL 9 : SERTIFIKAT KUALITAS (COA) & TIMBANGAN RESMI (COW)
                    </h4>
                    <p className="text-slate-700 text-justify text-xs leading-normal">
                      Hasil analisis laboratorium yang diterbitkan dalam bentuk <strong>Certificate of Analysis (COA)</strong> dan <strong>Certificate of Weight (COW)</strong> di pelabuhan muat bersifat final, mengikat, dan menjadi dasar utama pemenuhan spesifikasi teknis barang.
                    </p>
                  </div>

                  <div className="space-y-1 pt-0.5">
                    <h4 className="font-black text-slate-950 uppercase text-xs sm:text-[13px]">
                      PASAL 10 : PROSEDUR KLAIM KUALITAS & BATAS WAKTU SANGGAHAN
                    </h4>
                    <p className="text-slate-700 text-justify text-xs leading-normal">
                      Apabila terdapat ketidaksesuaian parameter mutu yang melebihi ambang batas penolakan (*rejection threshold*), PIHAK KEDUA wajib menyampaikan surat klaim resmi secara tertulis maksimal <strong>3 x 24 jam</strong> sejak penerimaan barang. Klaim yang diajukan melampaui batas waktu tersebut dianggap gugur dan barang diterima sepenuhnya.
                    </p>
                  </div>
                </div>

                {/* FOOTER HALAMAN 5 */}
                {renderFooter(5)}
              </div>
            )}

            {/* ========================================================================= */}
            {/* HALAMAN 6 (PAGE 6) : HAK, KEWAJIBAN PARA PIHAK & HAK RETENSI PENJUAL      */}
            {/* ========================================================================= */}
            {totalPages >= 6 && (
              <div className={`print-page bg-white p-5 sm:p-8 rounded-2xl shadow-md border border-slate-300 mx-auto max-w-4xl text-slate-900 text-xs sm:text-sm leading-relaxed relative flex flex-col justify-between min-h-[940px] print:min-h-0 print:h-[262mm] print:max-h-[270mm] print:shadow-none print:border-none print:rounded-none print:p-0 print:max-w-none print:overflow-hidden ${
                activePageView === 'all' || activePageView === 6 ? 'flex' : 'hidden print:flex'
              }`}>
                <div className="space-y-3">
                  {renderMiniHeader(6, `LEMBAR SPJB : HALAMAN 6 DARI ${totalPages}`)}

                  <div className="space-y-1">
                    <h4 className="font-black text-slate-950 uppercase text-xs sm:text-[13px]">
                      PASAL 11 : HAK DAN KEWAJIBAN PIHAK PERTAMA
                    </h4>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-700 text-xs pl-1 leading-normal">
                      <li>Berhak menerima seluruh pembayaran tepat waktu sesuai nilai dan termin yang disepakati.</li>
                      <li>Wajib menyediakan dan menyerahkan komoditas sesuai jadwal, spesifikasi, dan standar mutu.</li>
                      <li>Wajib melengkapi dokumen legalitas pengangkutan, surat jalan resmi, faktur pajak, dan sertifikat mutu.</li>
                    </ul>
                  </div>

                  <div className="space-y-1 pt-0.5">
                    <h4 className="font-black text-slate-950 uppercase text-xs sm:text-[13px]">
                      PASAL 12 : HAK DAN KEWAJIBAN PIHAK KEDUA
                    </h4>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-700 text-xs pl-1 leading-normal">
                      <li>Berhak menerima komoditas dengan volume dan kualitas sesuai spesifikasi kontrak.</li>
                      <li>Wajib melakukan pembayaran penuh sesuai termin transaksi dan menyerahkan bukti setor sah.</li>
                      <li>Wajib menyiapkan lokasi bongkar, kesiapan penerimaan armada, dan tim verifikator lapangan.</li>
                    </ul>
                  </div>

                  <div className="space-y-1 pt-0.5">
                    <h4 className="font-black text-slate-950 uppercase text-xs sm:text-[13px]">
                      PASAL 13 : HAK RETENSI DAN PENGUASAAN FISIK BARANG OLEH PENJUAL
                    </h4>
                    <p className="text-slate-700 text-justify text-xs leading-normal">
                      Berdasarkan <strong>Pasal 1812 KUHPerdata</strong>, PIHAK PERTAMA berhak menahan, menunda pelepasan dokumen muatan, atau menghentikan pembongkaran komoditas (*Right of Retention*) apabila PIHAK KEDUA belum menyelesaikan kewajiban pelunasan termin yang jatuh tempo.
                    </p>
                  </div>
                </div>

                {/* FOOTER HALAMAN 6 */}
                {renderFooter(6)}
              </div>
            )}

            {/* ========================================================================= */}
            {/* HALAMAN 7 (PAGE 7) : SANKSI KETERLAMBATAN, DEMURRAGE & HANGUS DP          */}
            {/* ========================================================================= */}
            {totalPages >= 7 && (
              <div className={`print-page bg-white p-5 sm:p-8 rounded-2xl shadow-md border border-slate-300 mx-auto max-w-4xl text-slate-900 text-xs sm:text-sm leading-relaxed relative flex flex-col justify-between min-h-[940px] print:min-h-0 print:h-[262mm] print:max-h-[270mm] print:shadow-none print:border-none print:rounded-none print:p-0 print:max-w-none print:overflow-hidden ${
                activePageView === 'all' || activePageView === 7 ? 'flex' : 'hidden print:flex'
              }`}>
                <div className="space-y-3">
                  {renderMiniHeader(7, `LEMBAR SPJB : HALAMAN 7 DARI ${totalPages}`)}

                  <div className="space-y-1">
                    <h4 className="font-black text-slate-950 uppercase text-xs sm:text-[13px]">
                      PASAL 14 : SANKSI KETERLAMBATAN PEMBAYARAN DAN DENDA
                    </h4>
                    <p className="text-slate-700 text-justify text-xs leading-normal">
                      Keterlambatan pembayaran termin oleh PIHAK KEDUA dikenakan denda keterlambatan sebesar <strong>1‰ (satu permil) per hari kalender</strong> dari sisa tagihan tertunggak, dengan akumulasi denda maksimal sebesar 5% (lima persen) dari total nilai kontrak.
                    </p>
                  </div>

                  <div className="space-y-1 pt-0.5">
                    <h4 className="font-black text-slate-950 uppercase text-xs sm:text-[13px]">
                      PASAL 15 : KETENTUAN DEMURRAGE & WAKTU TUNGGU ARMADA (LAYTIME)
                    </h4>
                    <p className="text-slate-700 text-justify text-xs leading-normal">
                      Batas waktu muat/bongkar (*Laytime*) disepakati maksimal 48 jam per tongkang / 4 jam per unit truk. Biaya kelebihan waktu tunggu (*Demurrage Rate*) menjadi tanggungan pihak yang menyebabkan keterlambatan sesuai invoice resmi perusahaan pelayaran/ekspedisi.
                    </p>
                  </div>

                  <div className="space-y-1 pt-0.5">
                    <h4 className="font-black text-slate-950 uppercase text-xs sm:text-[13px]">
                      PASAL 16 : PEMBATALAN SEPIHAK & KETENTUAN HANGUS UANG MUKA (DP)
                    </h4>
                    <p className="text-slate-700 text-justify text-xs leading-normal">
                      Apabila PIHAK KEDUA membatalkan pesanan secara sepihak setelah kontrak ditandatangani atau gagal melunasi sisa pembayaran dalam waktu 7 (tujuh) hari kerja kalender sejak jatuh tempo, maka <strong>Uang Muka (DP) yang telah disetorkan dinyatakan HANGUS sepenuhnya</strong> sebagai ganti rugi operasional PIHAK PERTAMA.
                    </p>
                  </div>
                </div>

                {/* FOOTER HALAMAN 7 */}
                {renderFooter(7)}
              </div>
            )}

            {/* ========================================================================= */}
            {/* HALAMAN 8 (PAGE 8) : KEADAAN MEMAKSA (FORCE MAJEURE) & ANTI-BRIBERY       */}
            {/* ========================================================================= */}
            {totalPages >= 8 && (
              <div className={`print-page bg-white p-5 sm:p-8 rounded-2xl shadow-md border border-slate-300 mx-auto max-w-4xl text-slate-900 text-xs sm:text-sm leading-relaxed relative flex flex-col justify-between min-h-[940px] print:min-h-0 print:h-[262mm] print:max-h-[270mm] print:shadow-none print:border-none print:rounded-none print:p-0 print:max-w-none print:overflow-hidden ${
                activePageView === 'all' || activePageView === 8 ? 'flex' : 'hidden print:flex'
              }`}>
                <div className="space-y-3">
                  {renderMiniHeader(8, `LEMBAR SPJB : HALAMAN 8 DARI ${totalPages}`)}

                  <div className="space-y-1">
                    <h4 className="font-black text-slate-950 uppercase text-xs sm:text-[13px]">
                      PASAL 17 : KEADAAN MEMAKSA (FORCE MAJEURE)
                    </h4>
                    <p className="text-slate-700 text-justify text-xs leading-normal">
                      Yang dimaksud Keadaan Memaksa (*Force Majeure*) adalah peristiwa luar biasa di luar kendali PARA PIHAK yang mengakibatkan tertundanya pelaksanaan kewajiban, meliputi: gempa bumi, banjir bandang, badai maritim tropis ekstrem, perang, blokade jalur pelayaran resmi, huru-hara, atau kebijakan embargo pemerintah yang sah.
                    </p>
                  </div>

                  <div className="space-y-1 pt-0.5">
                    <h4 className="font-black text-slate-950 uppercase text-xs sm:text-[13px]">
                      PASAL 18 : PROSEDUR PEMBERITAHUAN KEADAAN KAHAR
                    </h4>
                    <p className="text-slate-700 text-justify text-xs leading-normal">
                      Pihak yang mengalami *Force Majeure* wajib memberitahukan secara tertulis kepada pihak lainnya paling lambat <strong>2 x 24 jam</strong> sejak terjadinya peristiwa, disertai bukti surat keterangan dari instansi berwenang (BMKG, Kepolisian, Syahbandar, atau Pemda setempat).
                    </p>
                  </div>

                  <div className="space-y-1 pt-0.5">
                    <h4 className="font-black text-slate-950 uppercase text-xs sm:text-[13px]">
                      PASAL 19 : KERAHASIAAN INFORMASI & INTEGRITAS ANTI-SUAP (ANTI-BRIBERY)
                    </h4>
                    <p className="text-slate-700 text-justify text-xs leading-normal">
                      PARA PIHAK wajib menjaga kerahasiaan seluruh dokumen, data finansial, struktur harga, dan data pribadi transaksi ini. PARA PIHAK berkomitmen mematuhi prinsip *Good Corporate Governance* (GCG) dan melarang segala bentuk suap, gratifikasi, atau tindakan melawan hukum lainnya.
                    </p>
                  </div>
                </div>

                {/* FOOTER HALAMAN 8 */}
                {renderFooter(8)}
              </div>
            )}

            {/* ========================================================================= */}
            {/* HALAMAN 9 (PAGE 9) : PENYELESAIAN SENGKETA, TANDA TANGAN & SEGEL DIGITAL  */}
            {/* ========================================================================= */}
            {totalPages >= 9 && (
              <div className={`print-page bg-white p-5 sm:p-8 rounded-2xl shadow-md border border-slate-300 mx-auto max-w-4xl text-slate-900 text-xs sm:text-sm leading-relaxed relative flex flex-col justify-between min-h-[940px] print:min-h-0 print:h-[262mm] print:max-h-[270mm] print:shadow-none print:border-none print:rounded-none print:p-0 print:max-w-none print:overflow-hidden ${
                activePageView === 'all' || activePageView === 9 ? 'flex' : 'hidden print:flex'
              }`}>
                <div className="space-y-2.5">
                  {renderMiniHeader(9, `LEMBAR SPJB : HALAMAN 9 DARI ${totalPages} (PENGESAHAN)`)}

                  <div className="space-y-0.5">
                    <h4 className="font-black text-slate-950 uppercase text-xs sm:text-[13px]">
                      PASAL 20 : PENYELESAIAN SENGKETA DAN DOMISILI HUKUM
                    </h4>
                    <p className="text-slate-700 text-justify text-xs leading-normal">
                      Segala perselisihan yang timbul akan diselesaikan secara musyawarah mufakat dalam waktu 30 (tiga puluh) hari kalender. Apabila tidak tercapai mufakat, PARA PIHAK sepakat memilih domisili hukum tetap di Kantor Kepaniteraan <strong>Pengadilan Negeri Jambi</strong> atau melalui <strong>Badan Arbitrase Nasional Indonesia (BANI)</strong>.
                    </p>
                  </div>

                  <div className="space-y-0.5 pt-0.5">
                    <h4 className="font-black text-slate-950 uppercase text-xs sm:text-[13px]">
                      PASAL 21 : KEABSAHAN TANDA TANGAN ELEKTRONIK & SEGEL DIGITAL QR (UU ITE)
                    </h4>
                    <p className="text-slate-700 text-justify text-xs leading-normal">
                      Goresan tanda tangan digital pada sistem aplikasi ini beserta Barcode Segel Kriptografis QR {effectiveCompanyName} memiliki nilai pembuktian otentik yang sah dan mengikat menurut <strong>Pasal 5, 6, dan 11 UU ITE No. 1 Tahun 2024</strong>.
                    </p>
                  </div>

                  <p className="text-[11px] text-center text-slate-600 font-semibold pt-0.5 border-t border-slate-200">
                    Demikian Surat Perjanjian Jual Beli dan Pengadaan ini dibuat dalam format data elektronik terenkripsi yang sah, mengikat, dan memiliki kekuatan eksekutorial sejak saat penandatanganan dibubuhkan.
                  </p>

                  {/* LEMBAR TANDA TANGAN DIGITAL & SEGEL QR PARA PIHAK */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start pt-0.5">
                    
                    {/* PIHAK PERTAMA SIGNATURE (PENJUAL WITH QR SEAL) */}
                    <div className="p-3 bg-slate-50 border border-slate-300 rounded-xl text-center flex flex-col items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-slate-800 uppercase block mb-0.5">
                          PIHAK PERTAMA (PENJUAL)
                        </span>
                        <p className="text-xs text-blue-950 font-black">{effectiveCompanyName}</p>
                      </div>

                      {/* Official QR Code Seal & Authentic Digital Signature */}
                      <div className="my-1.5 w-full flex flex-col items-center">
                        <DigitalSignatureSeal
                          documentData={{
                            documentId: contract.contractNumber,
                            documentTitle: `SURAT PERJANJIAN JUAL BELI - ${contract.orderDetails?.productName || ''}`,
                            documentType: 'Surat Perjanjian Jual Beli (SPJB)',
                            partyFirst: effectiveCompanyName,
                            partySecond: contract.secondParty.companyName || contract.secondParty.name,
                            issueDate: contract.createdAt,
                            status: 'TERVERIFIKASI SAH (INKRACHT 100%)',
                            hashSha256: qrValidationCode,
                            signerType: 'director',
                            productName: contract.orderDetails?.productName,
                            quantity: contract.orderDetails?.quantity,
                            unit: contract.orderDetails?.unit,
                            totalPriceIDR: contract.orderDetails?.totalAmountIDR,
                            totalPriceUSD: contract.orderDetails?.totalAmountUSD,
                            purchasePattern: contract.orderDetails?.purchasePattern,
                            paymentTermScheme: contract.orderDetails?.paymentMethod,
                            deliveryTermLocation: contract.orderDetails?.destinationCoordinateLink || 'Sesuai Lokasi Terdaftar Konsumen',
                            contractBriefSummary: `Perikatan Jual Beli & Pengadaan ${contract.orderDetails?.productName || ''} sejumlah ${(contract.orderDetails?.quantity || 0).toLocaleString('id-ID')} ${contract.orderDetails?.unit || ''} berdasarkan skema ${contract.orderDetails?.purchasePattern || ''} dengan total transaksi Rp ${(contract.orderDetails?.totalAmountIDR || 0).toLocaleString('id-ID')} ($${(contract.orderDetails?.totalAmountUSD || 0).toLocaleString('en-US')}) antara Pihak I (${effectiveCompanyName}) dan Pihak II (${contract.secondParty.companyName || contract.secondParty.name}).`
                          }}
                          size="md"
                          signerLabel="TTD QRIS DIGITAL DIREKTUR"
                          signerType="director"
                        />
                      </div>

                      <div>
                        <p className="font-black text-xs text-slate-950 underline decoration-1 underline-offset-2">
                          {effectiveDirector}
                        </p>
                        <p className="text-[10px] text-slate-600">Direktur Utama</p>
                        <p className="font-semibold text-[10px] text-blue-900">Owner: {effectiveOwner}</p>
                      </div>
                    </div>

                    {/* PIHAK KEDUA SIGNATURE (PEMBELI) */}
                    <div className="p-3 bg-slate-50 border border-slate-300 rounded-xl text-center flex flex-col items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-slate-800 uppercase block mb-0.5">
                          PIHAK KEDUA (PEMBELI)
                        </span>
                        <p className="text-xs text-slate-950 font-black">
                          {contract.secondParty.companyName || contract.secondParty.name}
                        </p>
                      </div>

                      {signedDataUrl ? (
                        <div className="my-1.5 w-full flex flex-col items-center">
                          <DigitalSignatureSeal
                            documentData={{
                              documentId: contract.contractNumber,
                              documentTitle: `SURAT PERJANJIAN JUAL BELI - ${contract.orderDetails?.productName || ''}`,
                              documentType: 'Surat Perjanjian Jual Beli (SPJB)',
                              partyFirst: effectiveCompanyName,
                              partySecond: contract.secondParty.companyName || contract.secondParty.name,
                              issueDate: contract.secondParty.signedAt || contract.effectiveDate || contract.createdAt,
                              status: 'TERVERIFIKASI SAH (INKRACHT 100%)',
                              hashSha256: qrValidationCode,
                              signerType: 'buyer',
                              productName: contract.orderDetails?.productName,
                              quantity: contract.orderDetails?.quantity,
                              unit: contract.orderDetails?.unit,
                              totalPriceIDR: contract.orderDetails?.totalAmountIDR,
                              totalPriceUSD: contract.orderDetails?.totalAmountUSD,
                              purchasePattern: contract.orderDetails?.purchasePattern,
                              paymentTermScheme: contract.orderDetails?.paymentMethod,
                              deliveryTermLocation: contract.orderDetails?.destinationCoordinateLink || 'Sesuai Lokasi Terdaftar Konsumen',
                              contractBriefSummary: `Perikatan Jual Beli & Pengadaan ${contract.orderDetails?.productName || ''} sejumlah ${(contract.orderDetails?.quantity || 0).toLocaleString('id-ID')} ${contract.orderDetails?.unit || ''} berdasarkan skema ${contract.orderDetails?.purchasePattern || ''} dengan total transaksi Rp ${(contract.orderDetails?.totalAmountIDR || 0).toLocaleString('id-ID')} ($${(contract.orderDetails?.totalAmountUSD || 0).toLocaleString('en-US')}) antara Pihak I (${effectiveCompanyName}) dan Pihak II (${contract.secondParty.companyName || contract.secondParty.name}).`
                            }}
                            size="md"
                            customSignatureImgUrl={signedDataUrl}
                            signerLabel="TTD QRIS DIGITAL PEMBELI"
                            signerType="buyer"
                          />
                        </div>
                      ) : readOnly ? (
                        <div className="my-1.5 h-16 w-full max-w-[190px] flex items-center justify-center border-2 border-dashed border-slate-300 rounded-xl text-slate-400 text-[11px] bg-white">
                          Menunggu Tanda Tangan Pembeli
                        </div>
                      ) : (
                        <>
                          {/* Interactive Signature Canvas for Screen */}
                          <div className="my-1 w-full flex flex-col items-center print:hidden">
                            <div className="relative border-2 border-dashed border-blue-400 bg-white rounded-xl p-1 w-full max-w-[220px]">
                              <canvas
                                ref={canvasRef}
                                width={220}
                                height={75}
                                onMouseDown={startDrawing}
                                onMouseMove={draw}
                                onMouseUp={stopDrawing}
                                onMouseLeave={stopDrawing}
                                onTouchStart={startDrawing}
                                onTouchMove={draw}
                                onTouchEnd={stopDrawing}
                                className="w-full h-16 touch-none cursor-crosshair bg-white rounded-lg"
                              />
                              {!hasDrawn && (
                                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-slate-400 text-[10px]">
                                  <PenTool className="w-3 h-3 mb-0.5" />
                                  <span>Torehkan Tanda Tangan di Sini</span>
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2 mt-1">
                              <button
                                type="button"
                                onClick={clearCanvas}
                                className="px-2 py-0.5 text-[9px] text-rose-600 hover:bg-rose-50 rounded flex items-center gap-1 cursor-pointer font-bold"
                              >
                                <Eraser className="w-3 h-3" /> Hapus Goresan
                              </button>
                            </div>
                          </div>

                          {/* Clean Printable Blank Signature Area when printed unsigned */}
                          <div className="hidden print:flex flex-col items-center justify-center my-3 w-full max-w-[190px] h-16 border-b-2 border-dashed border-slate-400">
                            <span className="text-[9px] text-slate-400 italic mb-auto">Materai / Tanda Tangan Sah</span>
                          </div>
                        </>
                      )}

                      <div>
                        <p className="font-black text-xs text-slate-950 underline decoration-1 underline-offset-2">
                          {contract.secondParty.name}
                        </p>
                        <p className="text-[10px] text-slate-600">{contract.secondParty.idNumber}</p>
                        <p className="font-semibold text-[10px] text-slate-700">{contract.secondParty.userType}</p>
                      </div>
                    </div>
                  </div>

                  {/* ENCRYPTED LEGAL CHECKSUM BOX */}
                  <div className="p-2 bg-slate-100 border border-slate-300 rounded-xl flex flex-wrap items-center justify-between gap-2 text-[9px] text-slate-600 font-mono">
                    <div className="flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-blue-900 shrink-0" />
                      <span>HASH SHA-256: <strong>{qrValidationCode}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>STATUS: INKRACHT & MENGIKAT SECARA HUKUM</span>
                    </div>
                  </div>
                </div>

                {/* FOOTER HALAMAN 9 */}
                {renderFooter(9, totalPages, totalPages === 10 ? 'Bersambung ke Lampiran Halaman 10' : undefined)}
              </div>
            )}

            {/* ========================================================================= */}
            {/* HALAMAN 10 (PAGE 10) : LAMPIRAN TEKNIS & INTEGRITAS DJP ECORETAX          */}
            {/* ========================================================================= */}
            {totalPages >= 10 && (
              <div className={`print-page bg-white p-5 sm:p-8 rounded-2xl shadow-md border border-slate-300 mx-auto max-w-4xl text-slate-900 text-xs sm:text-sm leading-relaxed relative flex flex-col justify-between min-h-[940px] print:min-h-0 print:h-[262mm] print:max-h-[270mm] print:shadow-none print:border-none print:rounded-none print:p-0 print:max-w-none print:overflow-hidden ${
                activePageView === 'all' || activePageView === 10 ? 'flex' : 'hidden print:flex'
              }`}>
                <div className="space-y-2.5">
                  {renderMiniHeader(10, 'LEMBAR LAMPIRAN TEKNIS : HALAMAN 10 DARI 10 (AKHIR)', 'bg-amber-100 text-amber-950')}

                  <div className="text-center my-0.5">
                    <h3 className="text-xs sm:text-sm font-black text-slate-950 uppercase tracking-wide">
                      LAMPIRAN RESMI PERJANJIAN & SERTIFIKASI INTEGRITAS DIGITAL
                    </h3>
                    <p className="text-[10px] text-slate-600 font-mono">
                      Annexure Document of SPJB No: {contract.contractNumber}
                    </p>
                  </div>

                  {/* LAMPIRAN I: PARAMETER MUTU */}
                  <div className="border border-slate-300 rounded-xl overflow-hidden text-xs">
                    <div className="bg-slate-100 px-3 py-1 font-bold text-slate-900 border-b border-slate-300 flex items-center justify-between">
                      <span>LAMPIRAN I : STANDAR PARAMETER KUALITAS KOMODITAS & UJI LAB</span>
                      <span className="text-[9px] text-slate-500 font-mono">Standar SNI / ASTM</span>
                    </div>
                    <div className="p-2.5 text-slate-700 space-y-1">
                      <p className="text-[11px]">
                        Komoditas <strong>{contract.orderDetails.productName}</strong> yang diserahkan wajib memenuhi parameter mutu standar pengadaan {effectiveCompanyName} sebagaimana diuji melalui surveyor independen di pelabuhan muat.
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-center pt-0.5 font-mono text-[10px]">
                        <div className="p-1.5 bg-slate-50 border border-slate-200 rounded">
                          <span className="text-[8px] text-slate-500 block">KADAR AIR (MOISTURE)</span>
                          <span className="font-bold text-slate-900">Sesuai COA Lab</span>
                        </div>
                        <div className="p-1.5 bg-slate-50 border border-slate-200 rounded">
                          <span className="text-[8px] text-slate-500 block">KEMURNIAN (PURITY)</span>
                          <span className="font-bold text-slate-900">Min. 98.5%</span>
                        </div>
                        <div className="p-1.5 bg-slate-50 border border-slate-200 rounded">
                          <span className="text-[8px] text-slate-500 block">SUSUT TIMBANG</span>
                          <span className="font-bold text-slate-900">Max. 0.5%</span>
                        </div>
                        <div className="p-1.5 bg-slate-50 border border-slate-200 rounded">
                          <span className="text-[8px] text-slate-500 block">SURVEYOR LAB</span>
                          <span className="font-bold text-blue-900">Sucofindo/Carsurin</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* LAMPIRAN II: VERIFIKASI LOGISTIK */}
                  <div className="border border-slate-300 rounded-xl overflow-hidden text-xs">
                    <div className="bg-slate-100 px-3 py-1 font-bold text-slate-900 border-b border-slate-300 flex items-center justify-between">
                      <span>LAMPIRAN II : LEMBAR VERIFIKASI LOGISTIK & RUTE DISTRIBUSI</span>
                      <span className="text-[9px] text-slate-500 font-mono">Moda: {contract.orderDetails.shippingMethod}</span>
                    </div>
                    <div className="p-2.5 text-slate-700 space-y-0.5 text-[11px]">
                      <p>
                        <strong>Pola Pembelian:</strong> {contract.orderDetails.purchasePattern.toUpperCase()} | <strong>Moda Pengangkutan:</strong> {contract.orderDetails.shippingMethod}
                      </p>
                      {contract.orderDetails.destinationCoordinateLink && (
                        <p>
                          <strong>Titik Koordinat Penerimaan:</strong> {contract.orderDetails.destinationCoordinateLink}
                        </p>
                      )}
                      <p className="text-[10px] text-slate-500">
                        Setiap armada dilengkapi Surat Perintah Muat (SPM) dan Surat Jalan Pengantar Barang dengan verifikasi QR Code terintegrasi.
                      </p>
                    </div>
                  </div>

                  {/* LAMPIRAN III: INTEGRITAS SISTEM ECORETAX */}
                  <div className="border border-slate-300 rounded-xl overflow-hidden text-xs">
                    <div className="bg-slate-100 px-3 py-1 font-bold text-slate-900 border-b border-slate-300 flex items-center justify-between">
                      <span>LAMPIRAN III : SERTIFIKAT INTEGRITAS SISTEM DJP ECORETAX & AUDIT TRAIL</span>
                      <span className="text-[9px] bg-emerald-100 text-emerald-950 font-bold px-1.5 py-0.5 rounded">
                        COMPLIANT
                      </span>
                    </div>
                    <div className="p-2.5 text-slate-700 space-y-0.5 text-[10px]">
                      <p>
                        Dokumen Kontrak SPJB ini terintegrasi langsung dengan modul faktur elektronik ECoretax Direktorat Jenderal Pajak (DJP) Kementerian Keuangan Republik Indonesia. Seluruh kewajiban PPN dan PPh terdata dan dapat diverifikasi melalui server administrasi perpajakan resmi.
                      </p>
                      <div className="p-1.5 bg-slate-50 border border-slate-200 rounded font-mono text-[9px] space-y-0.5 text-slate-600 mt-0.5">
                        <p>KODE SERTIFIKASI SISTEM: <strong>CIP-ECORETAX-V2.5-DJP-APPROVED</strong></p>
                        <p>INTEGRITY DIGEST (SHA-256): <strong>{qrValidationCode}</strong></p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* FOOTER HALAMAN 10 */}
                {renderFooter(10, totalPages, 'Selesai')}
              </div>
            )}

            {/* INTERACTIVE SIGNING SUBMISSION PANEL (If Active Buyer Signing) */}
            {!readOnly && !contract.isSignedByBuyer && (
              <div className="max-w-4xl mx-auto p-4 bg-white border border-blue-300 rounded-2xl shadow-lg space-y-3 print:hidden">
                <label className="flex items-start gap-3 cursor-pointer text-xs text-slate-800 leading-snug">
                  <input
                    type="checkbox"
                    checked={isAgreed}
                    onChange={(e) => setIsAgreed(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
                  />
                  <span>
                    Saya selaku <strong>PIHAK KEDUA ({contract.secondParty.name})</strong> menyatakan bahwa data transaksi pengadaan ini adalah benar, sah, dan secara sadar menyetujui seluruh {totalPages} ({totalPages === 5 ? 'lima' : totalPages === 10 ? 'sepuluh' : totalPages}) halaman klausul serta pasal-pasal perjanjian jual beli ini dengan <strong>{effectiveCompanyName}</strong>.
                  </span>
                </label>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
                  <span className="text-[11px] text-slate-500">
                    Setelah ditandatangani, kontrak digital {totalPages} halaman ini akan tersimpan resmi dalam sistem dan dapat diunduh/dicetak kapan saja.
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      Tutup
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveSignature}
                      className="px-6 py-2.5 bg-gradient-to-r from-blue-700 to-indigo-900 hover:from-blue-800 hover:to-indigo-950 text-white font-black rounded-xl text-xs shadow-md flex items-center gap-2 cursor-pointer transition-all"
                    >
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      Tanda Tangani & Terbitkan Kontrak Sah ({totalPages} Hal)
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
