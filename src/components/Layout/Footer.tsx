import React from 'react';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  ShieldCheck, 
  Award, 
  FileCheck2, 
  Receipt,
  ExternalLink
} from 'lucide-react';
import { CompanyProfileData } from '../../types';
import { GOOGLE_USD_IDR_SEARCH_URL } from '../../services/exchangeRateService';

interface FooterProps {
  company: CompanyProfileData;
  onNavigate: (page: 'home' | 'admin' | 'user') => void;
}

export const Footer: React.FC<FooterProps> = ({ company, onNavigate }) => {
  return (
    <footer className="bg-slate-950 text-white border-t border-slate-800">
      {/* Main Footer Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          {/* Col 1: Corporate Identity & Leadership */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              {company.logoUrl ? (
                <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 p-1 flex items-center justify-center shadow overflow-hidden shrink-0">
                  <img
                    src={company.logoUrl}
                    alt={company.companyName}
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center font-black text-white text-lg shadow shrink-0">
                  CIP
                </div>
              )}
              <div>
                <h3 className="font-extrabold text-base tracking-tight text-white">
                  {company.companyName}
                </h3>
                <p className="text-xs text-amber-400 font-mono">{company.storeName}</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {company.footerAbout || 'Perusahaan perdagangan umum komoditas tambang batubara, pengadaan material konstruksi bersertifikasi SNI, serta penyedia jasa konstruksi bangunan sipil dan jalan terintegrasi dengan Surat Kontrak Hukum Digital di Indonesia.'}
            </p>

            <div className="p-3.5 bg-white/5 border border-white/10 rounded-2xl space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Owner & Komisaris:</span>
                <span className="font-bold text-white">{company.owner}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Direktur Utama:</span>
                <span className="font-bold text-white">{company.director}</span>
              </div>
            </div>
          </div>

          {/* Col 2: Navigation & Quick Links */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-bold text-xs text-amber-400 uppercase tracking-wider">
              Akses Aplikasi & Halaman
            </h4>
            <ul className="text-xs space-y-2 text-slate-300">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-amber-400 transition-colors cursor-pointer"
                >
                  1. Halaman Utama (Profil & Marketplace)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('admin')}
                  className="hover:text-amber-400 transition-colors cursor-pointer"
                >
                  2. Halaman Dashboard Admin (cipindo)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('user')}
                  className="hover:text-amber-400 transition-colors cursor-pointer"
                >
                  3. Halaman Dashboard User (Profil & Pesanan)
                </button>
              </li>
              <li>
                <a href="#profil-perusahaan" className="hover:text-amber-400 transition-colors">
                  • Profil Badan Usaha PT. CIP
                </a>
              </li>
              <li>
                <a href="#marketplace-produk" className="hover:text-amber-400 transition-colors">
                  • Katalog Komoditas & Material SNI
                </a>
              </li>
              <li>
                <a href="#kontak-email" className="hover:text-amber-400 transition-colors">
                  • Kirim Permintaan RFQ ke cafthen@gmail.com
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Official Address & Contact Details */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="font-bold text-xs text-amber-400 uppercase tracking-wider">
              Kontak & Alamat Kantor Pusat
            </h4>
            <div className="text-xs text-slate-300 space-y-2.5">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{company.address}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <a href={`mailto:${company.email}`} className="hover:underline font-mono">
                  {company.email}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <a href={`https://wa.me/6283149090950`} target="_blank" rel="noopener noreferrer" className="hover:underline font-mono">
                  {company.phone}
                </a>
              </div>
              <div className="pt-2">
                <a
                  href={company.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-xl text-[11px] font-semibold text-amber-300 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Buka Google Maps Kantor
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10 py-5 bg-black/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
          <div>
            © {new Date().getFullYear()} <strong>PT. CAFTHEN INDO PROJECT</strong> (CAFTHEN STORE ID). Hak Cipta Dilindungi Undang-Undang.
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <a
              href={GOOGLE_USD_IDR_SEARCH_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-amber-400 hover:text-amber-300 font-bold hover:underline"
              title="Pantau Update Kurs USD ke Rupiah Hari Ini di Google Search"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Kurs USD Google Market
            </a>
            <span className="flex items-center gap-1 text-emerald-400">
              <Receipt className="w-3.5 h-3.5" /> ECoretax DJP Integrated
            </span>
            <span className="flex items-center gap-1 text-blue-300">
              <FileCheck2 className="w-3.5 h-3.5" /> Digital Legal Contract
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
