import React from 'react';
import { motion } from 'motion/react';
import { 
  MapPin, 
  Navigation, 
  ExternalLink, 
  Building2, 
  Phone, 
  Mail,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { CompanyProfileData } from '../../types';

interface MapsSectionProps {
  company: CompanyProfileData;
}

export const MapsSection: React.FC<MapsSectionProps> = ({ company }) => {
  // Direct embed coordinates for Muaro Jambi location (-1.6157798, 103.5221609)
  const embedMapsSrc = `https://maps.google.com/maps?q=-1.6157798,103.5221609&t=&z=16&ie=UTF8&iwloc=&output=embed`;

  return (
    <section id="lokasi-kantor" className="py-14 sm:py-20 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12 space-y-2 sm:space-y-3">
          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-900 font-bold text-[11px] sm:text-xs rounded-full uppercase tracking-wider">
            LOKASI KANTOR PUSAT
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
            Alamat & Peta Interaktif PT. CAFTHEN INDO PROJECT
          </h2>
          <p className="text-slate-600 text-xs sm:text-base leading-relaxed">
            Kunjungi kantor operasional dan pusat koordinasi logistik kami di Muaro Jambi, Provinsi Jambi.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
          {/* Left: Office Address Information */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-5 bg-white p-5 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-6"
          >
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-blue-900 text-white flex items-center justify-center font-bold text-base sm:text-lg shadow-md shrink-0">
                  CIP
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-slate-900 leading-tight">
                    {company.companyName}
                  </h3>
                  <p className="text-xs text-blue-700 font-medium">{company.storeName}</p>
                </div>
              </div>

              {/* Address Details */}
              <div className="space-y-3 sm:space-y-4 text-xs sm:text-sm text-slate-700">
                <div className="flex items-start gap-3 p-3 sm:p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-blue-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 block text-xs sm:text-sm">Alamat Kantor:</span>
                    <p className="text-slate-600 mt-0.5 leading-relaxed text-xs sm:text-sm">{company.address}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 sm:p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 block text-xs sm:text-sm">Email Resmi:</span>
                    <p className="text-slate-600 mt-0.5 font-mono text-xs sm:text-sm break-all">{company.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 sm:p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 block text-xs sm:text-sm">Telp / WhatsApp Resmi:</span>
                    <p className="text-slate-600 mt-0.5 font-mono text-xs sm:text-sm">{company.phone}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 sm:p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 block text-xs sm:text-sm">Jam Operasional Layanan:</span>
                    <p className="text-slate-600 mt-0.5 text-xs sm:text-sm">Senin - Sabtu: 08:00 - 17:00 WIB (24 Jam Emergency Port Dispatch)</p>
                  </div>
                </div>
              </div>
            </div>

            <a
              href={company.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 sm:py-3.5 bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-800 hover:to-indigo-900 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
            >
              <Navigation className="w-4 h-4" /> Buka Navigasi Rute di Google Maps
            </a>
          </motion.div>

          {/* Right: Embedded Interactive Map */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-7 bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm relative min-h-[300px] sm:min-h-[420px]"
          >
            <iframe
              src={embedMapsSrc}
              title="Google Maps Lokasi PT. CAFTHEN INDO PROJECT"
              className="w-full h-full min-h-[300px] sm:min-h-[420px] border-0"
              loading="lazy"
              allowFullScreen
            />

            {/* Coordinates Floating Badge */}
            <div className="absolute bottom-3 left-3 right-3 sm:right-auto bg-slate-950/85 backdrop-blur-md text-white p-2.5 sm:p-3 rounded-xl text-xs border border-white/10 flex items-center gap-2 shadow-lg">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <span className="font-bold block text-white text-[11px] sm:text-xs">Titik Koordinat Resmi:</span>
                <span className="text-[10px] sm:text-[11px] text-slate-300 font-mono">-1.6157798, 103.5221609</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
