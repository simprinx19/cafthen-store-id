import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Play, 
  Video, 
  ExternalLink, 
  Sparkles, 
  ShieldCheck,
  Film
} from 'lucide-react';
import { CompanyProfileData } from '../../types';

interface VideoSectionProps {
  company: CompanyProfileData;
}

export const VideoSection: React.FC<VideoSectionProps> = ({ company }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  // Helper to extract or format embed URL from youtube link
  const getEmbedUrl = (url: string) => {
    if (url.includes('embed')) return url;
    if (url.includes('watch?v=')) {
      const videoId = url.split('watch?v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    }
    return url;
  };

  const embedSrc = getEmbedUrl(company.youtubeVideoUrl);

  return (
    <section id="video-kegiatan" className="py-14 sm:py-20 bg-slate-900 text-white border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12 space-y-2 sm:space-y-3">
          <span className="inline-block px-3 py-1 bg-amber-500/20 text-amber-300 font-bold text-[11px] sm:text-xs rounded-full uppercase tracking-wider border border-amber-500/30">
            VIDEO DOKUMENTASI & PROFIL PROYEK
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Video Kegiatan Kerja Lapangan
          </h2>
          <p className="text-slate-300 text-xs sm:text-base leading-relaxed">
            Saksikan secara langsung operasional logistik, pemuatan komoditas kapal, dan rekayasa konstruksi sipil PT. CAFTHEN INDO PROJECT.
          </p>
        </div>

        {/* Video Player Container */}
        <div className="max-w-4xl mx-auto rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-slate-950">
          <div className="relative aspect-video bg-black flex items-center justify-center">
            {isPlaying ? (
              <iframe
                src={embedSrc}
                title={company.youtubeVideoTitle}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="relative w-full h-full">
                <img
                  src="https://images.unsplash.com/photo-1541888946425-d0fbb186156a?auto=format&fit=crop&w=1200&q=80"
                  alt="Video Thumbnail"
                  className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex flex-col items-center justify-center p-4 sm:p-6 text-center">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsPlaying(true)}
                    className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center shadow-xl shadow-amber-500/30 transition-all cursor-pointer mb-3 sm:mb-4"
                  >
                    <Play className="w-6 h-6 sm:w-8 sm:h-8 fill-current ml-1" />
                  </motion.button>
                  <h3 className="text-base sm:text-xl font-bold text-white max-w-xl">
                    {company.youtubeVideoTitle}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-300 mt-2 flex items-center justify-center gap-1.5">
                    <Film className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0" />
                    <span>Klik tombol putar untuk menonton video dokumentasi resmi</span>
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Video Metadata Bar */}
          <div className="p-4 sm:p-5 bg-slate-950/90 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-300">
            <div className="flex items-center gap-2 text-center sm:text-left">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span>Dikelola & Diperbarui oleh Admin melalui CMS Halaman Utama</span>
            </div>
            <a
              href={company.youtubeVideoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1.5 shrink-0"
            >
              <span>Buka di YouTube</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
