import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Camera, 
  MapPin, 
  Calendar, 
  Layers, 
  HardHat, 
  Ship, 
  CheckCircle2, 
  ZoomIn,
  X
} from 'lucide-react';
import { ActivityPhoto } from '../../types';

interface ActivityGallerySectionProps {
  activities: ActivityPhoto[];
}

export const ActivityGallerySection: React.FC<ActivityGallerySectionProps> = ({ activities }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [activeModalPhoto, setActiveModalPhoto] = useState<ActivityPhoto | null>(null);

  const categories = [
    'Semua',
    'Konstruksi Sipil',
    'Pemuatan Kapal & Logistik',
    'Pengadaan & Material',
    'Quality Control'
  ];

  const filtered = selectedCategory === 'Semua'
    ? activities
    : activities.filter((a) => a.category === selectedCategory);

  return (
    <section id="kegiatan-kerja" className="py-14 sm:py-20 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12 space-y-2 sm:space-y-3">
          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-900 font-bold text-[11px] sm:text-xs rounded-full uppercase tracking-wider">
            DOKUMENTASI KERJA LAPANGAN
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
            Foto Kegiatan & Operasional Proyek
          </h2>
          <p className="text-slate-600 text-xs sm:text-base leading-relaxed">
            Bukti nyata pelaksanaan proyek konstruksi, pemuatan armada tongkang batubara, pengiriman dump truck, dan pengawasan mutu material di lapangan.
          </p>

          {/* Category Tabs */}
          <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 pt-3 sm:pt-4">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-blue-900 text-white shadow-md'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Activity Photo Grid with Hover Animation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {filtered.map((act) => (
            <motion.div
              key={act.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="group relative bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col cursor-pointer"
              onClick={() => setActiveModalPhoto(act)}
            >
              {/* Image Container with Zoom & Slide effect */}
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-950">
                <img
                  src={act.imageUrl}
                  alt={act.title}
                  className="w-full h-full object-cover group-hover:scale-110 group-hover:rotate-1 transition-transform duration-700 ease-out"
                />

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-300" />

                {/* Category Badge */}
                <div className="absolute top-3 left-3 px-2.5 py-1 bg-blue-900/80 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider rounded-lg shadow">
                  {act.category}
                </div>

                {/* Hover Quick Zoom Icon */}
                <div className="absolute top-3 right-3 p-2 bg-white/20 backdrop-blur-md text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <ZoomIn className="w-4 h-4" />
                </div>

                {/* Date & Location floating over image */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-slate-200">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="line-clamp-1">{act.location}</span>
                  </span>
                  <span className="flex items-center gap-1 shrink-0 font-mono">
                    <Calendar className="w-3.5 h-3.5 text-blue-300 shrink-0" />
                    <span>{act.date}</span>
                  </span>
                </div>
              </div>

              {/* Animated Text Panel (Slides up on hover) */}
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3 bg-white group-hover:bg-blue-50/40 transition-colors duration-300">
                <div className="space-y-1.5">
                  <h3 className="font-bold text-slate-900 text-sm leading-snug group-hover:text-blue-900 transition-colors">
                    {act.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                    {act.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-blue-700 font-semibold">
                  <span>Lihat Detail Dokumentasi</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Modal Lightbox for Zoomed Activity Photo */}
      <AnimatePresence>
        {activeModalPhoto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl border border-slate-200"
            >
              <button
                onClick={() => setActiveModalPhoto(null)}
                className="absolute top-3 right-3 z-10 p-2 bg-black/60 hover:bg-black text-white rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="aspect-[16/9] bg-slate-950">
                <img
                  src={activeModalPhoto.imageUrl}
                  alt={activeModalPhoto.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-4 sm:p-6 space-y-2.5 sm:space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 text-xs font-bold rounded-full">
                    {activeModalPhoto.category}
                  </span>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> {activeModalPhoto.date}
                  </span>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-500" /> {activeModalPhoto.location}
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-slate-950">
                  {activeModalPhoto.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {activeModalPhoto.description}
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
