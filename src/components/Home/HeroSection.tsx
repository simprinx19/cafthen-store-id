import React from 'react';
import { motion } from 'motion/react';
import { 
  Building2, 
  ShieldCheck, 
  TrendingUp, 
  Truck, 
  Ship, 
  FileCheck2, 
  ArrowRight, 
  Award,
  Sparkles,
  PhoneCall,
  MapPin,
  CheckCircle2,
  Receipt,
  Layers
} from 'lucide-react';
import { CompanyProfileData } from '../../types';

interface HeroSectionProps {
  company: CompanyProfileData;
  onExploreMarketplace: () => void;
  onConsultationClick: () => void;
  bgImage?: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  company,
  onExploreMarketplace,
  onConsultationClick,
  bgImage
}) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white py-16 lg:py-24">
      {/* Integrated Theme Background Image (Transparent Style) */}
      {bgImage && (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <img
            src={bgImage}
            alt="Kegiatan Ekspor, Arang Batok Kelapa, Kelapa Tua, Cangkang Sawit, dan Konstruksi Sipil"
            className="w-full h-full object-cover opacity-25 filter brightness-90 contrast-110 saturate-125"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-blue-950/60" />
        </div>
      )}

      {/* Background Decorative Grid & Glow */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Brand Header Banner: Logo & Title Presentation */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 p-3 sm:p-4 bg-white/10 border border-white/15 rounded-2xl backdrop-blur-xl max-w-2xl flex items-center gap-3 sm:gap-4 shadow-xl"
        >
          {/* Logo Container */}
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-white p-1 sm:p-1.5 shadow-lg border border-white/30 flex items-center justify-center shrink-0 overflow-hidden group">
            {company.logoUrl ? (
              <img
                src={company.logoUrl}
                alt={company.storeName}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-tr from-blue-900 to-indigo-900 text-white font-black text-lg sm:text-xl flex items-center justify-center rounded-xl">
                CIP
              </div>
            )}
          </div>

          {/* Web Title & Legal Entity */}
          <div className="space-y-0.5 flex-1 min-w-0">
            <h2 className="text-lg sm:text-2xl font-black tracking-tight text-white font-mono truncate">
              {company.storeName}
            </h2>
            <p className="text-xs sm:text-sm font-bold text-amber-300 truncate">
              {company.companyName}
            </p>
            <p className="text-[10px] sm:text-[11px] text-slate-300 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
              <span className="truncate">Mendalo Indah, Jambi Luar Kota, Muaro Jambi (36361)</span>
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Headlines & CTAs */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-7 space-y-5 sm:space-y-6"
          >
            {/* Theme Badge for the 5 Core Business Lines */}
            <div className="inline-flex flex-wrap items-center gap-1.5 sm:gap-2 p-1.5 px-3 bg-amber-400/10 border border-amber-400/30 rounded-full text-[11px] sm:text-xs text-amber-300 font-semibold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Kegiatan Ekspor</span>
              <span className="text-slate-500">•</span>
              <span>Produksi Arang Batok</span>
              <span className="text-slate-500">•</span>
              <span>Penjualan Kelapa Tua</span>
              <span className="text-slate-500">•</span>
              <span>Cangkang Sawit</span>
              <span className="text-slate-500">•</span>
              <span>Konstruksi Sipil</span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-snug sm:leading-[1.18] text-white">
              Solusi Terpadu <br />
              <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 bg-clip-text text-transparent">
                Perdagangan Komoditas,
              </span>{' '}
              Pengadaan & Konstruksi Sipil
            </h1>

            <p className="text-sm sm:text-base text-slate-300 max-w-2xl font-normal leading-relaxed">
              Mitra strategis terpercaya di Indonesia dalam pengadaan komoditas batubara curah, besi beton SNI, semen curah, material agregat, serta jasa konstruksi bangunan sipil berstandar nasional didukung digitalisasi kontrak hukum resmi (LOCO, FOB, FRANCO, CIF).
            </p>

            {/* Leadership & Legal Assurance */}
            <div className="p-3.5 sm:p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 text-xs text-slate-300">
              <div>
                <span className="text-[10px] text-amber-400 uppercase font-bold block">Owner & Komisaris</span>
                <span className="font-semibold text-white truncate block">{company.owner}</span>
              </div>
              <div className="sm:border-l sm:border-white/15 sm:pl-3">
                <span className="text-[10px] text-amber-400 uppercase font-bold block">Direktur Utama</span>
                <span className="font-semibold text-white truncate block">{company.director}</span>
              </div>
              <div className="sm:border-l sm:border-white/15 sm:pl-3">
                <span className="text-[10px] text-amber-400 uppercase font-bold block">Sistem Perpajakan</span>
                <span className="font-semibold text-emerald-400 truncate block">ECoretax DJP Integrated</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
              <button
                onClick={onExploreMarketplace}
                className="w-full sm:w-auto px-6 sm:px-7 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all flex items-center justify-center gap-2.5 text-xs sm:text-sm cursor-pointer transform hover:-translate-y-0.5"
              >
                <span>Jelajahi Katalog Produk</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onConsultationClick}
                className="w-full sm:w-auto px-5 sm:px-6 py-3.5 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold rounded-xl backdrop-blur-md transition-all flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer"
              >
                <PhoneCall className="w-4 h-4 text-amber-400" />
                <span>Konsultasi & Kontak Resmi</span>
              </button>
            </div>
          </motion.div>

          {/* Right Column: Key Operational Highlights Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-5"
          >
            <div className="relative rounded-3xl bg-gradient-to-b from-slate-900/90 to-blue-950/90 border border-white/15 p-6 sm:p-7 backdrop-blur-xl shadow-2xl space-y-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h3 className="font-bold text-base sm:text-lg text-white">Lini Bisnis & Kapabilitas</h3>
                  <p className="text-xs text-blue-200">PT. CAFTHEN INDO PROJECT</p>
                </div>
                <div className="p-2.5 bg-blue-600/30 rounded-xl text-amber-400 border border-blue-500/30">
                  <Building2 className="w-5 h-5" />
                </div>
              </div>

              {/* 3 Pillars */}
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3 hover:bg-white/10 transition-colors">
                  <div className="p-2 bg-amber-500/20 rounded-lg text-amber-400 shrink-0">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-white">Perdagangan Komoditas & Mineral</h4>
                    <p className="text-[11px] text-slate-300">
                      Suplai batubara GAR 4200 - 5000, pasir kuarsa silika, batu split, dan bahan galian tambang bersertifikasi.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3 hover:bg-white/10 transition-colors">
                  <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400 shrink-0">
                    <FileCheck2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-white">Pengadaan Material & Logistik</h4>
                    <p className="text-[11px] text-slate-300">
                      Besi beton SNI, semen PCC curah/sak, rental alat berat excavator & armada armada pengangkutan.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3 hover:bg-white/10 transition-colors">
                  <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400 shrink-0">
                    <Ship className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-white">Pola Serah Terima LOCO, FOB, FRANCO, CIF</h4>
                    <p className="text-[11px] text-slate-300">
                      Pengiriman armada darat (Trucking) dan armada air (Tongkang 300ft & Vessel) terintegrasi SPJB digital.
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom Quick Feature Highlights */}
              <div className="pt-2 border-t border-white/10 grid grid-cols-2 gap-2 text-center text-[10px] text-slate-300">
                <div className="p-2 bg-white/5 rounded-lg border border-white/5">
                  <span className="text-amber-400 font-bold block">100% LEGAL</span>
                  <span>IUP & AHU Kemenkumham</span>
                </div>
                <div className="p-2 bg-white/5 rounded-lg border border-white/5">
                  <span className="text-emerald-400 font-bold block">ECORETAX DJP</span>
                  <span>Faktur Pajak Otomatis</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
