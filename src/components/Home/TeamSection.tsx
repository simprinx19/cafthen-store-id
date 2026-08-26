import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Users2, 
  ChevronLeft, 
  ChevronRight, 
  Mail, 
  Phone, 
  Linkedin, 
  ShieldCheck, 
  Award,
  Briefcase
} from 'lucide-react';
import { TeamMember } from '../../types';

interface TeamSectionProps {
  team: TeamMember[];
}

export const TeamSection: React.FC<TeamSectionProps> = ({ team }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % team.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + team.length) % team.length);
  };

  return (
    <section id="tim-organisasi" className="py-14 sm:py-20 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 gap-4">
          <div className="space-y-2">
            <span className="inline-block px-3 py-1 bg-amber-100 text-amber-900 font-bold text-[11px] sm:text-xs rounded-full uppercase tracking-wider">
              STRUKTUR ORGANISASI & MANAJEMEN
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
              Dewan Direksi & Tim Profesional Perusahaan
            </h2>
            <p className="text-slate-600 text-xs sm:text-base max-w-2xl leading-relaxed">
              Dipimpin oleh jajaran eksekutif berpengalaman dan tenaga ahli teknik bersertifikasi untuk menjamin kualitas setiap pengadaan dan proyek.
            </p>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-2 self-end md:self-auto">
            <button
              onClick={prevSlide}
              className="p-2.5 sm:p-3 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
              title="Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={nextSlide}
              className="p-2.5 sm:p-3 rounded-xl bg-blue-900 hover:bg-blue-800 text-white transition-colors cursor-pointer shadow"
              title="Berikutnya"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Highlight Focus Carousel: Owner & Director Leaders Spotlight */}
        <div className="mb-8 sm:mb-12 p-5 sm:p-8 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-center">
            <div className="md:col-span-4 flex justify-center">
              <div className="relative w-40 h-40 sm:w-56 sm:h-56 rounded-2xl overflow-hidden border-4 border-amber-400/30 shadow-2xl">
                <img
                  src={team[currentSlide]?.photoUrl || team[0]?.photoUrl}
                  alt={team[currentSlide]?.name || 'Leader'}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-2 left-2 right-2 text-center">
                  <span className="text-[9px] sm:text-[10px] font-bold bg-amber-400 text-slate-950 px-2 py-0.5 rounded uppercase tracking-wider">
                    {team[currentSlide]?.position}
                  </span>
                </div>
              </div>
            </div>

            <div className="md:col-span-8 space-y-3 sm:space-y-4 text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-amber-300 text-xs font-semibold">
                <Award className="w-3.5 h-3.5" /> Pimpinan & Struktur Manajemen Utama
              </div>
              <h3 className="text-xl sm:text-3xl font-black text-white">
                {team[currentSlide]?.name}
              </h3>
              <p className="text-xs sm:text-sm font-semibold text-blue-300">
                {team[currentSlide]?.position} — PT. CAFTHEN INDO PROJECT
              </p>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {team[currentSlide]?.bio}
              </p>

              {team[currentSlide]?.socials && (
                <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-slate-300">
                  {team[currentSlide]?.socials?.email && (
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-4 h-4 text-amber-400" />
                      <span>{team[currentSlide]?.socials?.email}</span>
                    </div>
                  )}
                  {team[currentSlide]?.socials?.whatsapp && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-4 h-4 text-emerald-400" />
                      <span>{team[currentSlide]?.socials?.whatsapp}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Team Grid (All Team Members) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {team.map((member, idx) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => setCurrentSlide(idx)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                currentSlide === idx
                  ? 'border-blue-700 bg-blue-50/50 shadow-md ring-2 ring-blue-600/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white hover:shadow-lg'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                  <img
                    src={member.photoUrl}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-900 text-sm leading-tight">
                    {member.name}
                  </h4>
                  <p className="text-xs font-semibold text-blue-700">
                    {member.position}
                  </p>
                  <p className="text-[11px] text-slate-500 line-clamp-2">
                    {member.bio}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
