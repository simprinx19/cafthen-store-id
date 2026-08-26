import React, { useState } from 'react';
import { QrCode, ShieldCheck, CheckCircle2, Lock, Eye } from 'lucide-react';
import { SignatureSealGraphic } from './SignatureSealGraphic';
import { DocumentVerificationModal, DocumentVerificationData } from './DocumentVerificationModal';

interface DigitalSignatureSealProps {
  documentData: DocumentVerificationData;
  size?: 'sm' | 'md' | 'lg';
  showPrintStamp?: boolean;
  customSignatureImgUrl?: string;
  signerLabel?: string;
  signerType?: 'director' | 'buyer';
}

export const DigitalSignatureSeal: React.FC<DigitalSignatureSealProps> = ({
  documentData,
  size = 'md',
  showPrintStamp = true,
  customSignatureImgUrl,
  signerLabel,
  signerType
}) => {
  const [showModal, setShowModal] = useState(false);
  
  const isBuyer = signerType === 'buyer' || Boolean(signerLabel?.toLowerCase().includes('pembeli'));

  return (
    <>
      <div className="digital-signature-seal-container flex flex-col items-center justify-center space-y-2">
        {/* Interactive QRIS & Authentic Signature Box */}
        <div 
          onClick={() => setShowModal(true)}
          className="group relative bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white p-3 rounded-2xl border-2 border-slate-700 hover:border-amber-400 shadow-md transition-all duration-300 cursor-pointer flex flex-col items-center justify-center max-w-[210px] w-full text-center"
          title="Klik / Scan untuk Membuka Pop-up Keterangan Surat & Tanda Tangan Digital Asli"
        >
          {/* Top QRIS Header */}
          <div className="w-full flex items-center justify-between border-b border-red-900/40 pb-1.5 mb-2 px-1">
            <span className="text-[9px] font-black text-rose-400 tracking-wider uppercase flex items-center gap-1">
              <QrCode className="w-3.5 h-3.5 text-red-500" /> {signerLabel || (isBuyer ? 'TTD QRIS DIGITAL PEMBELI' : 'TTD QRIS DIGITAL DIREKTUR')}
            </span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[8px] font-mono font-bold">
              QRIS SAH
            </span>
          </div>

          {/* Center Graphic: Pure Authentic Scannable QR-CODE Seal */}
          <div className="bg-white p-2 rounded-xl border border-slate-700 shadow-inner my-1 group-hover:scale-105 transition-transform w-full flex items-center justify-center min-h-[60px] relative overflow-hidden">
            {(() => {
              const host = typeof window !== 'undefined' && window.location?.origin 
                ? window.location.origin 
                : 'https://cafthenindoproject.com';
              const qrPayload = `${host}/?docId=${encodeURIComponent(documentData.documentId)}&hash=${encodeURIComponent(documentData.hashSha256 || 'CIP-SHA256')}&signer=${encodeURIComponent(isBuyer ? documentData.partySecond : documentData.partyFirst)}&status=INKRACHT_100`;
              
              return (
                <SignatureSealGraphic 
                  size={size === 'sm' ? 100 : size === 'lg' ? 150 : 120}
                  signerType={isBuyer ? 'buyer' : 'director'}
                  signerName={documentData.partySecond}
                  qrValue={qrPayload}
                />
              );
            })()}
          </div>

          {/* Verification Click Button */}
          <div className="mt-2 w-full py-1.5 px-2 bg-gradient-to-r from-amber-500 to-amber-600 group-hover:from-amber-400 group-hover:to-amber-500 text-slate-950 rounded-xl font-extrabold text-[10px] flex items-center justify-center gap-1 shadow-sm transition-all">
            <Eye className="w-3.5 h-3.5" />
            <span>Scan / Pop-up Hasil Scan</span>
          </div>

          <span className="text-[8px] text-slate-400 font-mono mt-1">
            VERIFIED INKRACHT BY CIP
          </span>
        </div>
      </div>

      {/* Pop-up Verification Scan Result Modal */}
      {showModal && (
        <DocumentVerificationModal
          data={documentData}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
};
