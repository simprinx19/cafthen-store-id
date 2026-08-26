import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Mail, 
  Send, 
  CheckCircle2, 
  User, 
  Phone, 
  Building2, 
  MessageSquare,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { CompanyProfileData, UserProfile } from '../../types';

interface EmailContactSectionProps {
  company: CompanyProfileData;
  currentUser: UserProfile | null;
  onRequireAuth: () => void;
}

export const EmailContactSection: React.FC<EmailContactSectionProps> = ({
  company,
  currentUser,
  onRequireAuth
}) => {
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [senderCompany, setSenderCompany] = useState('');
  const [subject, setSubject] = useState('Permintaan Penawaran Harga (RFQ) & Pengadaan');
  const [messageText, setMessageText] = useState('');
  const [isSent, setIsSent] = useState(false);

  // Sync if current user is logged in
  useEffect(() => {
    if (currentUser) {
      setSenderName(currentUser.fullName);
      setSenderEmail(currentUser.email);
      setSenderPhone(currentUser.whatsapp);
      setSenderCompany(currentUser.companyName || '');
    }
  }, [currentUser]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName || !senderEmail || !messageText) {
      alert('Mohon lengkapi nama, email, dan pesan pengadaan Anda.');
      return;
    }

    // Direct simulated mailto / dispatch receipt
    setIsSent(true);
  };

  return (
    <section id="kontak-email" className="py-14 sm:py-20 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12 space-y-2 sm:space-y-3">
            <span className="inline-block px-3 py-1 bg-amber-100 text-amber-900 font-bold text-[11px] sm:text-xs rounded-full uppercase tracking-wider">
              LAYANAN EMAIL & KONSULTASI KONTRAK
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
              Kirim Email Resmi ke PT. CAFTHEN INDO PROJECT
            </h2>
            <p className="text-slate-600 text-xs sm:text-base leading-relaxed">
              Alamat tujuan email resmi: <strong className="text-blue-900 font-mono break-all">{company.email}</strong>. 
              Pihak pembeli terdaftar dapat mengirim pertanyaan RFQ, penawaran proyek, atau konsultasi kontrak.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 sm:p-10 shadow-xl relative overflow-hidden">
            {/* Logged in indicator */}
            {currentUser ? (
              <div className="mb-6 p-3.5 bg-blue-50 border border-blue-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-blue-950">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Mengirim sebagai Pembeli Terverifikasi: <strong>{currentUser.fullName}</strong> ({currentUser.userType})</span>
                </div>
                <span className="font-mono text-[11px] bg-blue-200/70 text-blue-900 px-2 py-0.5 rounded font-bold self-end sm:self-auto">
                  {currentUser.id}
                </span>
              </div>
            ) : (
              <div className="mb-6 p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-amber-950">
                <span>Sudah memiliki akun? Masuk untuk mengisi data profil secara otomatis.</span>
                <button
                  type="button"
                  onClick={onRequireAuth}
                  className="font-bold text-blue-800 hover:text-blue-950 underline cursor-pointer shrink-0"
                >
                  Masuk Sekarang
                </button>
              </div>
            )}

            {isSent ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-10 space-y-4"
              >
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900">Email Berhasil Dikirimkan!</h3>
                <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
                  Pesan Anda telah diteruskan ke alamat email resmi <strong>{company.email}</strong>. Tim dewan direksi dan administrasi kami akan merespons dalam waktu 1x24 jam kerja.
                </p>
                <div className="pt-4">
                  <button
                    onClick={() => {
                      setIsSent(false);
                      setMessageText('');
                    }}
                    className="px-6 py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-semibold rounded-xl text-xs cursor-pointer"
                  >
                    Kirim Pesan Lain
                  </button>
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Nama Pengirim / Pemohon *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={senderName}
                        onChange={(e) => setSenderName(e.target.value)}
                        placeholder="Nama lengkap Anda"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white text-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Alamat Email Pengirim *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={senderEmail}
                        onChange={(e) => setSenderEmail(e.target.value)}
                        placeholder="email@perusahaan.co.id"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white text-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Nomor Telepon / WhatsApp
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                      <input
                        type="tel"
                        value={senderPhone}
                        onChange={(e) => setSenderPhone(e.target.value)}
                        placeholder="+628..."
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white text-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Nama Perusahaan / Instansi (Opsional)
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={senderCompany}
                        onChange={(e) => setSenderCompany(e.target.value)}
                        placeholder="Contoh: PT. Sumber Energi Sejahtera"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white text-slate-900"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Subjek / Pokok Permohonan
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white text-slate-900"
                  >
                    <option value="Permintaan Penawaran Harga (RFQ) & Pengadaan">
                      Permintaan Penawaran Harga (RFQ) & Pengadaan
                    </option>
                    <option value="Konsultasi Proyek Konstruksi Sipil & Bangunan">
                      Konsultasi Proyek Konstruksi Sipil & Bangunan
                    </option>
                    <option value="Penjadwalan Pengapalan Tongkang & Vessel Batu Bara">
                      Penjadwalan Pengapalan Tongkang & Vessel Batu Bara
                    </option>
                    <option value="Klarifikasi Kontrak Digital & Pembayaran Bertahap">
                      Klarifikasi Kontrak Digital & Pembayaran Bertahap
                    </option>
                    <option value="Kemitraan Strategis & Kerjasama Vendor">
                      Kemitraan Strategis & Kerjasama Vendor
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Isi Pesan / Rincian Kebutuhan Proyek *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Tuliskan detail spesifikasi volume, jadwal pengiriman, atau pertanyaan Anda kepada PT. CAFTHEN INDO PROJECT..."
                    className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white text-slate-900"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="w-full sm:w-auto py-3 px-8 bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-800 hover:to-indigo-900 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4 shrink-0" /> Kirim Email ke {company.email}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
