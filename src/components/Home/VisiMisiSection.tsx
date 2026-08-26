import React from 'react';
import { motion } from 'motion/react';
import { 
  Target, 
  Compass, 
  CheckCircle2, 
  Sparkles, 
  Building2, 
  TrendingUp, 
  HardHat, 
  Truck
} from 'lucide-react';
import { CompanyProfileData } from '../../types';

interface VisiMisiSectionProps {
  company: CompanyProfileData;
}

export const VisiMisiSection: React.FC<VisiMisiSectionProps> = ({ company }) => {
  return (
    <section id="visi-misi" className="py-14 sm:py-20 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16 space-y-2 sm:space-y-3">
          <span className="inline-block px-3 py-1 bg-amber-100 text-amber-900 font-bold text-[11px] sm:text-xs rounded-full uppercase tracking-wider">
            LANDASAN STRATEGIS PERUSAHAAN
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
            Visi & Misi PT. CAFTHEN INDO PROJECT
          </h2>
          <p className="text-slate-600 text-xs sm:text-base leading-relaxed">
            Fokus teguh kami dalam memajukan industri perdagangan komoditas, procurement barang dan jasa, serta konstruksi bangunan sipil berstandar mutu tinggi.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
          {/* Visi Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white p-6 sm:p-8 lg:p-10 rounded-3xl shadow-xl flex flex-col justify-between"
          >
            <div className="space-y-4 sm:space-y-6">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-amber-400/20 text-amber-400 flex items-center justify-center border border-amber-400/30">
                <Target className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <div>
                <span className="text-[10px] sm:text-xs font-bold text-amber-400 uppercase tracking-widest block mb-2">
                  VISI UTAMA
                </span>
                <h3 className="text-lg sm:text-2xl font-black text-white leading-snug">
                  "{company.visi}"
                </h3>
              </div>
            </div>

            <div className="pt-5 sm:pt-6 mt-5 sm:mt-6 border-t border-white/10 flex items-center gap-3 text-xs text-blue-200">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white shrink-0">
                CIP
              </div>
              <p className="leading-snug">Landasan nilai dan komitmen jangka panjang dewan direksi PT. CAFTHEN INDO PROJECT.</p>
            </div>
          </motion.div>

          {/* Misi Card & Points */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="lg:col-span-7 bg-slate-50 border border-slate-200 p-6 sm:p-8 lg:p-10 rounded-3xl flex flex-col justify-between"
          >
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-blue-600/10 text-blue-700 flex items-center justify-center shrink-0">
                  <Compass className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <span className="text-[10px] sm:text-xs font-bold text-blue-800 uppercase tracking-wider block">
                    MISI STRATEGIS
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                    5 Pilar Misi Operasional Perusahaan
                  </h3>
                </div>
              </div>

              <div className="space-y-3 sm:space-y-4">
                {company.misi.map((point, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 sm:p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-start gap-3 hover:border-blue-500/50 hover:bg-blue-50/20 transition-colors"
                  >
                    <div className="w-6 h-6 rounded-full bg-blue-900 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                      {point}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
