import React from 'react';
import { motion } from 'motion/react';
import { 
  Building2, 
  ShieldCheck, 
  CheckCircle2, 
  Layers, 
  HardHat, 
  Ship, 
  Award, 
  FileCheck2,
  Users2
} from 'lucide-react';
import { CompanyProfileData } from '../../types';

interface CompanyProfileSectionProps {
  company: CompanyProfileData;
}

export const CompanyProfileSection: React.FC<CompanyProfileSectionProps> = ({ company }) => {
  return (
    <section id="profil-perusahaan" className="py-14 sm:py-20 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16 space-y-2.5 sm:space-y-3">
          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-900 font-bold text-[11px] sm:text-xs rounded-full uppercase tracking-wider">
            PROFIL & KEGIATAN PERUSAHAAN
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
            Dedikasi, Integritas & Rantai Pasok Skala Nasional
          </h2>
          <p className="text-slate-600 text-xs sm:text-base leading-relaxed">
            <strong>PT. CAFTHEN INDO PROJECT</strong> adalah badan usaha berbadan hukum yang berkantor pusat di Muaro Jambi, berfokus pada integrasi sektor perdagangan komoditas sumber daya, pengadaan barang & jasa, serta rekayasa konstruksi sipil.
          </p>
        </div>

        {/* 3 Main Activities Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-8 mb-10 sm:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white p-5 sm:p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
          >
            <div className="space-y-3 sm:space-y-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                <Layers className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">Perdagangan Komoditas (General Trading)</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Penyedia pasokan batubara kalori GAR 4200 - 5000 kcal/kg, agregat batu split, pasir silika, dan komoditas industri dengan jaminan legalitas IUP resmi dan sertifikasi surveyor independen (Sucofindo / Carsurin).
              </p>
            </div>
            <ul className="mt-5 sm:mt-6 pt-4 border-t border-slate-100 text-xs text-slate-700 space-y-2 font-medium">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Skema FOB Tongkang & Mother Vessel</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>COA & COW Analisis Kualitas Lengkap</span>
              </li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-white p-5 sm:p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
          >
            <div className="space-y-3 sm:space-y-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-blue-600/10 text-blue-700 flex items-center justify-center font-bold">
                <FileCheck2 className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">Pengadaan Barang & Jasa (Procurement)</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Pengadaan material besi beton SNI 2052:2017 berbagai diameter, semen curah Portland Composite Cement (PCC), sewa armada alat berat (Excavator PC200/Bulldozer), dan perlengkapan logistik proyek.
              </p>
            </div>
            <ul className="mt-5 sm:mt-6 pt-4 border-t border-slate-100 text-xs text-slate-700 space-y-2 font-medium">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Pola Pengiriman Franco sampai di Lokasi Proyek</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Terdaftar Sistem Perpajakan Resmi ECoretax DJP</span>
              </li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-white p-5 sm:p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
          >
            <div className="space-y-3 sm:space-y-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-emerald-600/10 text-emerald-700 flex items-center justify-center font-bold">
                <HardHat className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">Konstruksi Bangunan Sipil & Infrastruktur</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Pelaksanaan pekerjaan konstruksi bangunan gedung, pergudangan baja struktural, jalan rigid pavement beton, jembatan, penataan lahan (land clearing), dan saluran drainase terpadu.
              </p>
            </div>
            <ul className="mt-5 sm:mt-6 pt-4 border-t border-slate-100 text-xs text-slate-700 space-y-2 font-medium">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Tenaga Ahli Bersertifikat SKA / SKK LPJK PUPR</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Standar K3 & Asuransi Konstruksi Menyeluruh</span>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Corporate Legal Factsheet */}
        <div className="p-5 sm:p-8 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl shadow-xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 sm:gap-6 text-left">
            <div>
              <span className="text-[10px] sm:text-xs text-amber-400 font-bold uppercase tracking-wider block">Badan Usaha</span>
              <p className="text-base sm:text-lg font-extrabold text-white mt-1">{company.companyName}</p>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">Perseroan Terbatas Resmi</p>
            </div>
            <div className="sm:border-l sm:border-white/10 sm:pl-5 md:pl-6">
              <span className="text-[10px] sm:text-xs text-amber-400 font-bold uppercase tracking-wider block">Pimpinan Korporasi</span>
              <p className="text-xs sm:text-sm font-bold text-white mt-1">Owner: {company.owner}</p>
              <p className="text-[11px] sm:text-xs text-slate-300">Direktur: {company.director}</p>
            </div>
            <div className="md:border-l md:border-white/10 sm:border-t md:border-t-0 sm:pt-4 md:pt-0 sm:pl-0 md:pl-6">
              <span className="text-[10px] sm:text-xs text-amber-400 font-bold uppercase tracking-wider block">Basis Operasional</span>
              <p className="text-xs sm:text-sm font-bold text-white mt-1">Jambi Luar Kota, Muaro Jambi</p>
              <p className="text-[11px] sm:text-xs text-slate-300">Kode Pos 36361 - Jambi</p>
            </div>
            <div className="sm:border-l sm:border-white/10 sm:border-t md:border-t-0 sm:pt-4 md:pt-0 sm:pl-5 md:pl-6">
              <span className="text-[10px] sm:text-xs text-amber-400 font-bold uppercase tracking-wider block">Inovasi Layanan</span>
              <p className="text-xs sm:text-sm font-bold text-white mt-1">Kontrak Digital & E-Commerce</p>
              <p className="text-[11px] sm:text-xs text-emerald-400 font-semibold">Tanda Tangan Elektronik & QR Seal</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
