import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface SignatureSealGraphicProps {
  className?: string;
  size?: number; // size in pixels, default 160
  showCaption?: boolean;
  directorName?: string;
  companyName?: string;
  signerType?: 'director' | 'buyer';
  signerName?: string;
  qrValue?: string;
}

export const SignatureSealGraphic: React.FC<SignatureSealGraphicProps> = ({
  className = '',
  size = 160,
  showCaption = false,
  directorName = 'H. M. HENDRI, S.T., M.M.',
  companyName = 'PT. CAFTHEN INDO PROJECT',
  signerType = 'director',
  signerName,
  qrValue
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const isBuyer = signerType === 'buyer';
  const headerTitle = isBuyer ? 'TTD QRIS DIGITAL PEMBELI' : 'TTD QRIS DIGITAL DIREKTUR';
  const displaySignerName = isBuyer ? (signerName || 'PIHAK KEDUA (PEMBELI SAH)') : directorName;
  const displayEntity = isBuyer ? 'TERVERIFIKASI SISTEM DIGITAL CIP' : companyName;
  const accentColor = isBuyer ? '#1d4ed8' : '#059669';
  const headerBgColor = isBuyer ? '#1e40af' : '#dc2626';

  useEffect(() => {
    // Construct standard scannable payload (URL or structured verification text)
    const origin = typeof window !== 'undefined' && window.location?.origin 
      ? window.location.origin 
      : 'https://cafthenindoproject.com';

    const defaultUrl = `${origin}/?verify=${encodeURIComponent(isBuyer ? 'PEMBELI' : 'DIREKTUR')}&signer=${encodeURIComponent(displaySignerName)}&status=TERVERIFIKASI_SAH_INKRACHT_100`;
    const payload = qrValue || defaultUrl;

    // Generate ISO Standard high-contrast QR Code with High Error Correction ('H')
    QRCode.toDataURL(payload, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 400,
      color: {
        dark: isBuyer ? '#0f2771' : '#044e33',
        light: '#ffffff'
      }
    }).then(url => {
      setQrDataUrl(url);
    }).catch(err => {
      console.error('QR Code generation error:', err);
    });
  }, [qrValue, isBuyer, displaySignerName]);

  return (
    <div className={`inline-flex flex-col items-center justify-center ${className}`}>
      <div 
        className="relative flex flex-col items-center justify-between select-none bg-white rounded-xl border-2 p-2 shadow-md overflow-hidden transition-all duration-200 hover:shadow-lg"
        style={{ width: `${size}px`, minHeight: `${size * 1.15}px`, borderColor: accentColor }}
      >
        {/* TOP OFFICIAL QRIS HEADER BANNER */}
        <div 
          className="w-full py-1 px-2 rounded-md flex items-center justify-between text-white shadow-sm mb-1"
          style={{ background: `linear-gradient(135deg, ${headerBgColor}, ${isBuyer ? '#1e3a8a' : '#991b1b'})` }}
        >
          <div className="flex items-center gap-1.5">
            <span className="font-black tracking-widest text-[12px] text-white">QRIS</span>
            <span className="w-[1.5px] h-3 bg-amber-400"></span>
            <span className="font-extrabold text-[8px] tracking-wide text-amber-300 uppercase truncate">
              {headerTitle}
            </span>
          </div>
          <span className="text-[7px] font-mono font-bold bg-white/20 px-1 py-0.5 rounded text-white">
            SAH
          </span>
        </div>

        {/* REAL SCANNABLE QR CODE IMAGE CONTAINER */}
        <div className="relative w-full flex items-center justify-center p-1.5 bg-slate-50 rounded-lg border border-slate-200 shadow-inner my-1">
          {qrDataUrl ? (
            <div className="relative flex items-center justify-center w-full">
              <img 
                src={qrDataUrl} 
                alt="QR Code Tanda Tangan Digital (Scannable)" 
                className="w-full aspect-square object-contain rounded-sm"
              />
              {/* Center Monogram Shield Overlay (Will not block scanning because ErrorCorrectionLevel='H') */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div 
                  className="bg-white p-0.5 rounded border shadow-sm flex items-center justify-center opacity-95"
                  style={{ borderColor: accentColor }}
                >
                  <span 
                    className="px-1 py-0.2 text-[7px] font-black text-white rounded-[2px]"
                    style={{ backgroundColor: isBuyer ? '#1d4ed8' : '#059669' }}
                  >
                    {isBuyer ? 'BUYER' : 'CIP'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full h-24 flex items-center justify-center text-[10px] text-slate-400 font-mono animate-pulse">
              Memuat QR...
            </div>
          )}
        </div>

        {/* BOTTOM SIGNER DETAILS STRIP */}
        <div className="w-full mt-1 pt-1 border-t border-slate-200 text-center">
          <p className="font-black text-[9px] text-slate-900 truncate leading-tight">
            {displaySignerName}
          </p>
          <p className="text-[7.5px] font-extrabold text-emerald-700 font-mono truncate">
            {displayEntity}
          </p>
        </div>
      </div>

      {showCaption && (
        <div className="mt-1 text-center">
          <span className="text-[10px] font-extrabold text-slate-900 block uppercase tracking-wide">
            {isBuyer ? 'TANDA TANGAN QRIS DIGITAL PEMBELI SAH' : 'TANDA TANGAN QRIS DIGITAL DIREKTUR UTAMA'}
          </span>
          <span className="text-[9px] text-emerald-700 font-mono font-bold block">
            TERVERIFIKASI SAH & INKRACHT BY CIP
          </span>
        </div>
      )}
    </div>
  );
};



