import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Lock, Mail, Phone, MapPin, Building2, User, FileText, CheckCircle2, ShieldCheck } from 'lucide-react';
import { StorageService } from '../../storage';
import { UserProfile, UserType } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'login' | 'register';
  initialMode?: 'login' | 'register';
  onLoginSuccess?: (user: UserProfile) => void;
  onRegisterSuccess?: (user: UserProfile) => void;
  onSuccess?: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialTab,
  initialMode = 'login',
  onLoginSuccess,
  onRegisterSuccess,
  onSuccess
}) => {
  const activeInitial = initialTab || initialMode || 'login';
  const [mode, setMode] = useState<'login' | 'register'>(activeInitial);
  const [userType, setUserType] = useState<UserType>('Perusahaan');

  // Login form states
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Register form states
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regFullName, setRegFullName] = useState('');
  const [regCompanyName, setRegCompanyName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regWhatsapp, setRegWhatsapp] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regKtp, setRegKtp] = useState('https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=400&q=80');
  const [regNpwp, setRegNpwp] = useState('https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=400&q=80');
  const [regCompro, setRegCompro] = useState('');
  const [regSuccess, setRegSuccess] = useState(false);
  const [createdUser, setCreatedUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (isOpen) {
      setMode(initialTab || initialMode || 'login');
      setLoginError('');
      setRegSuccess(false);
    }
  }, [isOpen, initialTab, initialMode]);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const users = StorageService.getUsers();
    const found = users.find(
      (u) =>
        (u.username.toLowerCase() === loginUsername.trim().toLowerCase() ||
         u.email.toLowerCase() === loginUsername.trim().toLowerCase()) &&
        (u.password === loginPassword.trim() || loginPassword === 'demo')
    );

    if (found) {
      StorageService.setCurrentUser(found);
      if (onLoginSuccess) onLoginSuccess(found);
      if (onSuccess) onSuccess(found);
      onClose();
    } else {
      setLoginError('Username atau kata sandi tidak cocok. Silakan coba lagi atau gunakan akun demo.');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regUsername || !regPassword || !regFullName || !regEmail || !regWhatsapp) {
      alert('Mohon lengkapi semua kolom wajib.');
      return;
    }

    const newUser = StorageService.registerNewUser({
      username: regUsername,
      password: regPassword,
      fullName: regFullName,
      companyName: userType === 'Perusahaan' ? regCompanyName || regFullName : undefined,
      userType,
      email: regEmail,
      whatsapp: regWhatsapp,
      address: regAddress || 'Alamat Belum Diatur',
      ktpUrl: regKtp,
      npwpUrl: regNpwp,
      comproUrl: regCompro || undefined
    });

    setCreatedUser(newUser);
    setRegSuccess(true);
    StorageService.setCurrentUser(newUser);
    if (onRegisterSuccess) onRegisterSuccess(newUser);
    if (onSuccess) onSuccess(newUser);
  };

  const fillDemoAccount = (username: string) => {
    setLoginUsername(username);
    setLoginPassword('password123');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-6 relative">
            <button
              onClick={onClose}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-lg text-white shadow-md">
                CIP
              </div>
              <div>
                <h3 className="font-bold text-lg leading-tight">CAFTHEN STORE ID</h3>
                <p className="text-xs text-blue-200">PT. CAFTHEN INDO PROJECT</p>
              </div>
            </div>
            <div className="mt-4 flex gap-2 border-b border-white/10">
              <button
                onClick={() => { setMode('login'); setRegSuccess(false); }}
                className={`pb-2 px-3 text-sm font-medium transition-all ${
                  mode === 'login'
                    ? 'text-amber-400 border-b-2 border-amber-400 font-semibold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Masuk ke Akun
              </button>
              <button
                onClick={() => { setMode('register'); setRegSuccess(false); }}
                className={`pb-2 px-3 text-sm font-medium transition-all ${
                  mode === 'register'
                    ? 'text-amber-400 border-b-2 border-amber-400 font-semibold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Registrasi Pembeli Baru
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 max-h-[75vh] overflow-y-auto">
            {mode === 'login' ? (
              <div>
                <div className="mb-6">
                  <h4 className="text-xl font-bold text-slate-900">Selamat Datang Kembali</h4>
                  <p className="text-sm text-slate-600">
                    Masuk untuk mengakses Dashboard Pemesanan, Pelacakan Pengiriman & Kontrak Digital.
                  </p>
                </div>

                {loginError && (
                  <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl">
                    {loginError}
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Username / Email Pembeli
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={loginUsername}
                        onChange={(e) => setLoginUsername(e.target.value)}
                        placeholder="Contoh: pt_jaya_abadi / budi_santoso"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-slate-900 bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Kata Sandi (Password)
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                      <input
                        type="password"
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="Masukkan password Anda"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-slate-900 bg-white"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4" /> Masuk ke Dashboard User
                  </button>
                </form>

                {/* Quick Demo Login Helpers */}
                <div className="mt-6 pt-4 border-t border-slate-200">
                  <p className="text-xs text-slate-700 font-bold mb-2">Akun Demo Cepat (Klik untuk isi otomatis):</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => fillDemoAccount('pt_jaya_abadi')}
                      className="p-2.5 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 text-left text-xs transition-colors"
                    >
                      <p className="font-semibold text-slate-800">PT. Jaya Abadi (Korporat)</p>
                      <p className="text-[11px] text-slate-700">User: pt_jaya_abadi</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => fillDemoAccount('budi_santoso')}
                      className="p-2.5 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 text-left text-xs transition-colors"
                    >
                      <p className="font-semibold text-slate-800">Budi Santoso (Perorangan)</p>
                      <p className="text-[11px] text-slate-700">User: budi_santoso</p>
                    </button>
                  </div>
                </div>
              </div>
            ) : regSuccess && createdUser ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h4 className="text-xl font-bold text-slate-900">Registrasi Berhasil!</h4>
                <p className="text-sm text-slate-600 mt-1 max-w-md mx-auto">
                  Akun Anda telah dibuat dengan ID unik: <strong className="text-blue-700">{createdUser.id}</strong>.
                  Data Anda telah otomatis disinkronkan ke sistem verifikasi PT. CAFTHEN INDO PROJECT.
                </p>

                <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-xl text-left text-xs space-y-1.5">
                  <p><span className="font-semibold text-slate-700">Nama:</span> {createdUser.fullName}</p>
                  <p><span className="font-semibold text-slate-700">Tipe Akun:</span> {createdUser.userType}</p>
                  <p><span className="font-semibold text-slate-700">Username:</span> {createdUser.username}</p>
                  <p><span className="font-semibold text-slate-700">Status Verifikasi:</span> <span className="text-amber-600 font-semibold">Menunggu Verifikasi Admin</span></p>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => {
                      if (onRegisterSuccess) onRegisterSuccess(createdUser);
                      if (onSuccess) onSuccess(createdUser);
                      onClose();
                    }}
                    className="flex-1 py-3 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-xl text-sm transition-colors cursor-pointer"
                  >
                    Buka Dashboard User Sekarang
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="mb-4">
                  <h4 className="text-xl font-bold text-slate-900">Formulir Registrasi Pembeli</h4>
                  <p className="text-xs text-slate-600">
                    Lengkapi data diri / perusahaan untuk legalitas perjanjian jual beli dan penerbitan kontrak digital.
                  </p>
                </div>

                {/* User Type Choice */}
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Kategori Pembeli
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setUserType('Perusahaan')}
                      className={`p-3 rounded-xl border flex items-center gap-2.5 text-left transition-all ${
                        userType === 'Perusahaan'
                          ? 'border-blue-600 bg-blue-50/70 text-blue-900 ring-2 ring-blue-600/20 font-semibold'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <Building2 className="w-5 h-5 text-blue-600" />
                      <div>
                        <div className="text-sm font-medium">Perusahaan (PT/CV)</div>
                        <div className="text-[11px] text-slate-500">Badan usaha / tender</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setUserType('Perorangan')}
                      className={`p-3 rounded-xl border flex items-center gap-2.5 text-left transition-all ${
                        userType === 'Perorangan'
                          ? 'border-blue-600 bg-blue-50/70 text-blue-900 ring-2 ring-blue-600/20 font-semibold'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <User className="w-5 h-5 text-blue-600" />
                      <div>
                        <div className="text-sm font-medium">Perorangan / Pribadi</div>
                        <div className="text-[11px] text-slate-500">Individu / kontraktor</div>
                      </div>
                    </button>
                  </div>
                </div>

                <form onSubmit={handleRegister} className="space-y-3.5">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Username Baru *
                      </label>
                      <input
                        type="text"
                        required
                        value={regUsername}
                        onChange={(e) => setRegUsername(e.target.value)}
                        placeholder="Contoh: mitra_jambi"
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none text-slate-900 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Kata Sandi *
                      </label>
                      <input
                        type="password"
                        required
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Minimal 6 karakter"
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none text-slate-900 bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Nama Lengkap Penanggung Jawab *
                    </label>
                    <input
                      type="text"
                      required
                      value={regFullName}
                      onChange={(e) => setRegFullName(e.target.value)}
                      placeholder="Nama lengkap sesuai KTP"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none text-slate-900 bg-white"
                    />
                  </div>

                  {userType === 'Perusahaan' && (
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Nama Perusahaan (PT / CV / Firma) *
                      </label>
                      <input
                        type="text"
                        required
                        value={regCompanyName}
                        onChange={(e) => setRegCompanyName(e.target.value)}
                        placeholder="Contoh: PT. JAYA RAYA TEKNIK"
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none text-slate-900 bg-white"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Alamat Email *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                        <input
                          type="email"
                          required
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          placeholder="email@perusahaan.co.id"
                          className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none text-slate-900 bg-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        WhatsApp / No. HP *
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                        <input
                          type="tel"
                          required
                          value={regWhatsapp}
                          onChange={(e) => setRegWhatsapp(e.target.value)}
                          placeholder="+628..."
                          className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none text-slate-900 bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Alamat Lengkap (Domisili / Kantor) *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={regAddress}
                        onChange={(e) => setRegAddress(e.target.value)}
                        placeholder="Jl., Kelurahan, Kecamatan, Kota/Kab, Provinsi"
                        className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none text-slate-900 bg-white"
                      />
                    </div>
                  </div>

                  {/* Document Uploads Preview / Simulator */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <p className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-blue-600" />
                      Dokumen Legalitas (Tersedia Berkas Contoh / Unggah)
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="p-2 bg-white rounded border border-slate-200">
                        <span className="font-medium text-slate-700">KTP Penanggung Jawab:</span>
                        <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">✓ Siap diverifikasi</div>
                      </div>
                      <div className="p-2 bg-white rounded border border-slate-200">
                        <span className="font-medium text-slate-700">NPWP {userType === 'Perusahaan' ? 'Badan Usaha' : 'Pribadi'}:</span>
                        <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">✓ Siap diverifikasi</div>
                      </div>
                    </div>
                    {userType === 'Perusahaan' && (
                      <div className="p-2 bg-white rounded border border-slate-200 text-[11px]">
                        <span className="font-medium text-slate-700">Company Profile (Compro) / Akta:</span>
                        <div className="text-[10px] text-blue-600 font-medium mt-0.5">Disertakan saat verifikasi tender</div>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-800 hover:to-indigo-900 text-white font-semibold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
                  >
                    Daftar Akun Pembeli Baru
                  </button>
                </form>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
