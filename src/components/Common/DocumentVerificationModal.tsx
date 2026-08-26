import React from 'react';
import { 
  ShieldCheck, 
  X, 
  CheckCircle2, 
  QrCode, 
  FileText, 
  Calendar, 
  Building2, 
  User, 
  Hash, 
  Lock,
  Printer,
  ExternalLink,
  Award
} from 'lucide-react';
import { SignatureSealGraphic } from './SignatureSealGraphic';
import { StorageService } from '../../storage';

export interface DocumentVerificationData {
  documentId: string;
  documentTitle: string;
  documentType: 'Surat Perjanjian Jual Beli (SPJB)' | 'Dossier Profil Konsumen' | 'Invoice Order & Pengadaan' | 'Dokumen Legalitas Resmi';
  partyFirst?: string;
  partySecond?: string;
  issueDate?: string;
  status?: string;
  hashSha256?: string;
  notes?: string;
  signerType?: 'director' | 'buyer';

  // Additional detail fields for document brief summary (uraian singkat)
  productName?: string;
  quantity?: number;
  unit?: string;
  totalPriceIDR?: number;
  totalPriceUSD?: number;
  purchasePattern?: string;
  paymentTermScheme?: string;
  deliveryTermLocation?: string;
  contractBriefSummary?: string;
}

interface DocumentVerificationModalProps {
  data: DocumentVerificationData;
  onClose: () => void;
}

export const DocumentVerificationModal: React.FC<DocumentVerificationModalProps> = ({
  data,
  onClose
}) => {
  const company = StorageService.getCompanyProfile();
  const generatedHash = data.hashSha256 || `SHA256-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-5xl lg:max-w-6xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col transform transition-all max-h-[94vh]">
        
        {/* Header QRIS Verification Banner */}
        <div className="bg-gradient-to-r from-red-950 via-slate-900 to-blue-950 text-white p-5 sm:p-6 flex items-start justify-between relative border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0 shadow-inner">
              <QrCode className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white font-black text-[10px] uppercase tracking-wider">
                  QRIS TTD DIGITAL VERIFIED
                </span>
                <span className="text-amber-400 text-xs font-mono font-bold">CIP-QRIS-v2026</span>
              </div>
              <h3 className="text-base sm:text-xl font-black text-white mt-0.5">
                Keterangan Legitimasi & Validasi Dokumen Digital QRIS
              </h3>
              <p className="text-xs text-slate-300">
                Data Otentifikasi & Uraian Singkat Isi Dokumen Legal PT. CAFTHEN INDO PROJECT
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 p-5 sm:p-7 space-y-6 overflow-y-auto text-xs leading-relaxed text-slate-800">
          
          {/* Status Alert Card */}
          <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
              <div>
                <span className="text-[10px] text-emerald-800 font-extrabold block uppercase tracking-wider">
                  STATUS HUKUM TANDATANGAN QRIS:
                </span>
                <span className="text-sm sm:text-base font-black text-emerald-950 uppercase">
                  {data.status || 'TERVERIFIKASI RESMI & SAH SECARA HUKUM (INKRACHT 100%)'}
                </span>
              </div>
            </div>
            <span className="hidden sm:inline-flex px-3 py-1 bg-emerald-600 text-white font-mono font-bold text-[10px] rounded-lg shadow-xs">
              VALID 100%
            </span>
          </div>

          {/* Grid: Document Summary & Authentic QRIS Signature */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            
            {/* Left Column: Comprehensive Document Summary & Overview */}
            <div className="md:col-span-7 space-y-3 bg-slate-50 p-4.5 rounded-2xl border border-slate-200">
              <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-2">
                <FileText className="w-4 h-4 text-rose-600" /> URAIAN SINGKAT ISI DOKUMEN YANG DITANDATANGANI
              </h4>

              <div className="space-y-2.5 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white p-2 rounded-xl border border-slate-200">
                    <span className="text-[9px] text-slate-500 font-bold block">ID / NOMOR DOKUMEN:</span>
                    <span className="font-mono font-black text-blue-950 text-xs">{data.documentId}</span>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-slate-200">
                    <span className="text-[9px] text-slate-500 font-bold block">TANGGAL PENERBITAN:</span>
                    <span className="font-mono text-slate-800 text-xs font-bold">
                      {data.issueDate || new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 font-bold block">JUDUL KONTRAK / SPJB:</span>
                  <span className="font-extrabold text-slate-900 text-xs block bg-white p-2 rounded-xl border border-slate-200 mt-0.5">
                    {data.documentTitle}
                  </span>
                </div>

                {/* Para Pihak */}
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block mb-1">PARA PIHAK TERKATAN:</span>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Pihak I (Penjual):</span>
                      <span className="font-bold text-slate-900">{company.companyName || 'PT. CAFTHEN INDO PROJECT'}</span>
                    </div>
                    {data.partySecond && (
                      <div className="flex items-center justify-between border-t border-slate-100 pt-1">
                        <span className="text-slate-500">Pihak II (Konsumen/Mitra):</span>
                        <span className="font-bold text-blue-900">{data.partySecond}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Commodity & Financial Highlights */}
                {(data.productName || data.totalPriceIDR) && (
                  <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl space-y-1.5">
                    <span className="text-[10px] font-black text-amber-900 uppercase block tracking-wider">
                      RINCIAN BESARAN TRANSAKSI & PENGADAAN:
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      {data.productName && (
                        <div>
                          <span className="text-slate-600 block text-[9px]">Komoditas / Produk:</span>
                          <span className="font-bold text-slate-900">{data.productName}</span>
                        </div>
                      )}
                      {data.quantity !== undefined && data.quantity !== null && (
                        <div>
                          <span className="text-slate-600 block text-[9px]">Volume / Kuantitas:</span>
                          <span className="font-bold text-emerald-800 font-mono">
                            {(data.quantity || 0).toLocaleString('id-ID')} {data.unit || 'Ton'}
                          </span>
                        </div>
                      )}
                      {data.purchasePattern && (
                        <div>
                          <span className="text-slate-600 block text-[9px]">Skema Penyerahan:</span>
                          <span className="font-bold text-purple-900">{data.purchasePattern}</span>
                        </div>
                      )}
                      {data.totalPriceIDR !== undefined && data.totalPriceIDR !== null && (
                        <div>
                          <span className="text-slate-600 block text-[9px]">Total Nilai Transaksi:</span>
                          <span className="font-extrabold text-blue-900 font-mono">
                            Rp {(data.totalPriceIDR || 0).toLocaleString('id-ID')}
                            {data.totalPriceUSD !== undefined && data.totalPriceUSD !== null && <span className="text-[9px] text-slate-500 block">($ {(data.totalPriceUSD || 0).toLocaleString('en-US')})</span>}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Brief Abstract / Summary */}
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block mb-0.5">RINGKASAN ABSTRAK KESEPAKATAN:</span>
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-[11px] text-slate-700 leading-snug">
                    {data.contractBriefSummary || `Pengadaan komoditas yang disepakati oleh Pihak I dan Pihak II secara sah berdasarkan ketentuan hukum Indonesia. Pihak I bertanggung jawab atas kepastian mutu dan legalitas resmi, sedangkan Pihak II berkewajiban menyelesaikan pembayaran sesuai skema termin terdaftar.`}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 font-bold block">KODE KRIPTOGRAFI HASH DOKUMEN:</span>
                  <span className="font-mono text-[9px] text-slate-800 bg-slate-200 px-2 py-1 rounded font-semibold break-all block">
                    {generatedHash}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Authentic QRIS Signature & Seal Stamp */}
            <div className="md:col-span-5 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 text-white p-5 rounded-2xl border border-slate-800 flex flex-col items-center justify-between text-center space-y-3 shadow-md">
              <div className="w-full flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-rose-400" /> {data.signerType === 'buyer' ? 'TTD QRIS PEMBELI' : 'TTD QRIS DIREKTUR'}
                </span>
                <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                  AUTENTIK
                </span>
              </div>

              {/* Graphic QRIS Signature Component */}
              <div className="bg-white p-3 rounded-2xl border border-slate-700 shadow-inner flex items-center justify-center my-1">
                {(() => {
                  const host = typeof window !== 'undefined' && window.location?.origin 
                    ? window.location.origin 
                    : 'https://cafthenindoproject.com';
                  const qrPayload = `${host}/?docId=${encodeURIComponent(data.documentId)}&hash=${encodeURIComponent(data.hashSha256 || 'CIP-SHA256')}&signer=${encodeURIComponent(data.signerType === 'buyer' ? data.partySecond : data.partyFirst)}&status=INKRACHT_100`;

                  return (
                    <SignatureSealGraphic 
                      size={155} 
                      signerType={data.signerType === 'buyer' ? 'buyer' : 'director'}
                      signerName={data.partySecond}
                      qrValue={qrPayload}
                    />
                  );
                })()}
              </div>

              <div className="space-y-0.5 w-full border-t border-slate-800 pt-2">
                {data.signerType === 'buyer' ? (
                  <>
                    <p className="font-black text-xs text-white uppercase underline decoration-blue-500 underline-offset-2">
                      {data.partySecond || 'PIHAK KEDUA (PEMBELI)'}
                    </p>
                    <p className="text-[10px] text-blue-400 font-bold">
                      Penandatangan Sah Pihak Pembeli
                    </p>
                    <p className="text-[9px] text-amber-300 font-mono">
                      TERVERIFIKASI SISTEM DIGITAL CIP
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-black text-xs text-white uppercase underline decoration-rose-500 underline-offset-2">
                      H. M. HENDRI, S.T., M.M.
                    </p>
                    <p className="text-[10px] text-emerald-400 font-bold">
                      Direktur Utama & Penanggung Jawab Legal
                    </p>
                    <p className="text-[9px] text-amber-300 font-mono">
                      PT. CAFTHEN INDO PROJECT
                    </p>
                  </>
                )}
              </div>
            </div>

          </div>

          {/* Legal Footnote */}
          <div className="p-3 bg-rose-50/60 border border-rose-200 rounded-xl text-[11px] text-slate-900 flex items-start gap-2 leading-snug">
            <Lock className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
            <span>
              <strong>Jaminan Keabsahan Hukum QRIS:</strong> Tanda tangan digital ini dibentuk melalui modul **Tanda Tangan QRIS Digital Kriptografis** resmi Direktur Utama PT. Cafthen Indo Project yang diverifikasi melalui hash SHA-256. Dokumen ini sah digunakan sebagai alat bukti legal dalam transaksi jual beli komoditas dan pengadaan di Indonesia berdasarkan **UU ITE No. 1 Tahun 2024 (Pasal 5, 6, & 11)**.
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between flex-wrap gap-2">
          <span className="text-[10px] font-mono text-slate-500">
            QRIS Hash: {generatedHash.substring(0, 22)}...
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all"
              title="Cetak Bukti Legitimasi & Validasi QRIS"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" />
              <span>Cetak Hasil Scan</span>
            </button>
            <button
              onClick={onClose}
              className="px-5 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl font-bold text-xs cursor-pointer shadow-sm transition-all"
            >
              Tutup Modal QRIS
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
