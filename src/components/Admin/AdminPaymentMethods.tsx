import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  CreditCard, 
  Building2, 
  QrCode, 
  Plus, 
  Trash2, 
  Save, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ShieldCheck, 
  DollarSign, 
  Layers, 
  Percent, 
  Clock, 
  Eye,
  Check,
  X,
  FileCheck2,
  Lock,
  ArrowRight
} from 'lucide-react';
import { 
  PaymentSettingsState, 
  PaymentMethodConfig, 
  BankAccount, 
  PaymentMethod 
} from '../../types';
import { StorageService } from '../../storage';
import { formatIDR } from '../../utils/formatters';

interface AdminPaymentMethodsProps {
  onDataUpdated: () => void;
}

export const AdminPaymentMethods: React.FC<AdminPaymentMethodsProps> = ({ onDataUpdated }) => {
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettingsState>(
    StorageService.getPaymentSettings()
  );
  const [activeTab, setActiveTab] = useState<'methods' | 'banks' | 'qris' | 'terms'>('methods');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [editingMethod, setEditingMethod] = useState<PaymentMethodConfig | null>(null);

  // Bank Form State for adding new bank
  const [newBank, setNewBank] = useState<Partial<BankAccount>>({
    bankName: '',
    accountNumber: '',
    accountHolder: 'PT. CAFTHEN INDO PROJECT / HENDRI PUTRA.S.Kom',
    branch: '',
    notes: 'Rekening Transaksi Pengadaan',
    isPrimary: false
  });
  const [isAddingBank, setIsAddingBank] = useState(false);

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  const handleToggleMethod = (methodId: string) => {
    const updatedMethods = paymentSettings.methods.map((m) => {
      if (m.id === methodId) {
        return { ...m, enabled: !m.enabled };
      }
      return m;
    });

    const newSettings: PaymentSettingsState = {
      ...paymentSettings,
      methods: updatedMethods
    };

    setPaymentSettings(newSettings);
    StorageService.savePaymentSettings(newSettings);
    onDataUpdated();
    showSuccess('Status metode pembayaran berhasil diperbarui & tersinkron ke pembeli.');
  };

  const handleSaveMethodEdit = (updated: PaymentMethodConfig) => {
    const updatedMethods = paymentSettings.methods.map((m) => 
      m.id === updated.id ? updated : m
    );
    const newSettings: PaymentSettingsState = {
      ...paymentSettings,
      methods: updatedMethods
    };
    setPaymentSettings(newSettings);
    StorageService.savePaymentSettings(newSettings);
    setEditingMethod(null);
    onDataUpdated();
    showSuccess(`Pengaturan skema ${updated.name} berhasil disimpan.`);
  };

  const handleAddBank = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBank.bankName || !newBank.accountNumber || !newBank.accountHolder) {
      alert('Nama Bank, Nomor Rekening, dan Atas Nama wajib diisi.');
      return;
    }

    const createdBank: BankAccount = {
      id: `bank-${Date.now()}`,
      bankName: newBank.bankName!,
      accountNumber: newBank.accountNumber!,
      accountHolder: newBank.accountHolder!,
      branch: newBank.branch || 'Kantor Cabang Jambi',
      notes: newBank.notes || 'Rekening Transaksi Resmi',
      isPrimary: Boolean(newBank.isPrimary)
    };

    let updatedBanks = [...paymentSettings.bankAccounts];
    if (createdBank.isPrimary) {
      updatedBanks = updatedBanks.map((b) => ({ ...b, isPrimary: false }));
    }
    updatedBanks.push(createdBank);

    const newSettings: PaymentSettingsState = {
      ...paymentSettings,
      bankAccounts: updatedBanks
    };

    setPaymentSettings(newSettings);
    StorageService.savePaymentSettings(newSettings);
    setIsAddingBank(false);
    setNewBank({
      bankName: '',
      accountNumber: '',
      accountHolder: 'PT. CAFTHEN INDO PROJECT / HENDRI PUTRA.S.Kom',
      branch: '',
      notes: 'Rekening Transaksi Pengadaan',
      isPrimary: false
    });
    onDataUpdated();
    showSuccess('Rekening Bank baru berhasil ditambahkan dan disinkronkan ke seluruh sistem.');
  };

  const handleDeleteBank = (bankId: string) => {
    if (paymentSettings.bankAccounts.length <= 1) {
      alert('Minimal harus ada 1 rekening bank aktif untuk menerima pembayaran pembeli.');
      return;
    }
    if (!confirm('Apakah Anda yakin ingin menghapus rekening bank ini?')) return;

    const updatedBanks = paymentSettings.bankAccounts.filter((b) => b.id !== bankId);
    const newSettings: PaymentSettingsState = {
      ...paymentSettings,
      bankAccounts: updatedBanks
    };

    setPaymentSettings(newSettings);
    StorageService.savePaymentSettings(newSettings);
    onDataUpdated();
    showSuccess('Rekening bank berhasil dihapus.');
  };

  const handleSetPrimaryBank = (bankId: string) => {
    const updatedBanks = paymentSettings.bankAccounts.map((b) => ({
      ...b,
      isPrimary: b.id === bankId
    }));
    const newSettings: PaymentSettingsState = {
      ...paymentSettings,
      bankAccounts: updatedBanks
    };
    setPaymentSettings(newSettings);
    StorageService.savePaymentSettings(newSettings);
    onDataUpdated();
    showSuccess('Rekening utama berhasil diperbarui.');
  };

  const handleSaveQRIS = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.savePaymentSettings(paymentSettings);
    onDataUpdated();
    showSuccess('Pengaturan QRIS Merchant berhasil disimpan & tersinkron.');
  };

  const handleResetDefaults = () => {
    if (!confirm('Kembalikan seluruh pola & metode pembayaran ke pengaturan standar default?')) return;
    const defaults = StorageService.resetPaymentSettingsToDefault();
    setPaymentSettings(defaults);
    onDataUpdated();
    showSuccess('Pengaturan metode pembayaran telah dikembalikan ke standar awal.');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-blue-800/40">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider">
              SINKRONISASI REAL-TIME
            </span>
            <span className="text-xs text-blue-300 font-mono">DASHBOARD & KASIR CHECKOUT</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2.5">
            <CreditCard className="w-6 h-6 text-amber-400" />
            Kelola Metode & Pola Pembayaran
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl mt-1">
            Atur skema termin, aktifkan/nonaktifkan metode pembayaran, kelola rekening bank tujuan transfer, dan konfigurasi QRIS. Semua perubahan akan langsung tersinkron pada saat pembeli melakukan checkout dan penandatanganan kontrak digital.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleResetDefaults}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Standar</span>
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl flex items-center gap-3 text-xs font-bold shadow-sm"
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </motion.div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {[
          { id: 'methods', label: 'Daftar Pola & Skema Pembayaran', icon: Layers, count: paymentSettings.methods.length },
          { id: 'banks', label: 'Rekening Bank Resmi', icon: Building2, count: paymentSettings.bankAccounts.length },
          { id: 'qris', label: 'QRIS Bank Indonesia', icon: QrCode, count: paymentSettings.qrisConfig.enabled ? 'Aktif' : 'Nonaktif' },
          { id: 'terms', label: 'Ketentuan Pembayaran & Jatuh Tempo', icon: Clock }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition-all cursor-pointer ${
                isActive
                  ? 'bg-blue-900 text-white shadow-md'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  isActive ? 'bg-amber-400 text-slate-950' : 'bg-slate-100 text-slate-700'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Daftar Metode & Pola Pembayaran */}
      {activeTab === 'methods' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paymentSettings.methods.map((method) => {
              const isEnabled = method.enabled;
              return (
                <div
                  key={method.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    isEnabled
                      ? 'bg-white border-slate-200 shadow-sm hover:border-blue-300'
                      : 'bg-slate-50 border-slate-200 opacity-70'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="px-2.5 py-0.5 bg-blue-100 text-blue-950 text-xs font-extrabold rounded-lg font-mono">
                          {method.code}
                        </span>
                        {method.badge && (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-900 text-[10px] font-bold rounded-md">
                            {method.badge}
                          </span>
                        )}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {isEnabled ? 'TERSEDIA DI CHECKOUT' : 'DINONAKTIFKAN'}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-slate-900 text-sm">{method.name}</h4>
                    </div>

                    {/* Toggle Switch */}
                    <button
                      onClick={() => handleToggleMethod(method.id)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        isEnabled ? 'bg-blue-900' : 'bg-slate-300'
                      }`}
                      title={isEnabled ? 'Klik untuk menonaktifkan' : 'Klik untuk mengaktifkan'}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          isEnabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed mb-3">
                    {method.description}
                  </p>

                  {/* Milestone Breakdown Pills */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs mb-3">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Struktur Persentase Termin:
                    </span>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 bg-white rounded-lg border border-slate-200">
                        <span className="text-[9px] text-slate-500 block">Down Payment</span>
                        <span className="font-bold text-blue-900">{method.downPaymentPercent}%</span>
                      </div>
                      <div className="p-2 bg-white rounded-lg border border-slate-200">
                        <span className="text-[9px] text-slate-500 block">Progres Muat</span>
                        <span className="font-bold text-blue-900">{method.progressPaymentPercent || 0}%</span>
                      </div>
                      <div className="p-2 bg-white rounded-lg border border-slate-200">
                        <span className="text-[9px] text-slate-500 block">Pelunasan Tiba</span>
                        <span className="font-bold text-blue-900">{method.finalPaymentPercent}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Terms List */}
                  {method.terms && method.terms.length > 0 && (
                    <div className="space-y-1 mb-4 text-[11px] text-slate-600">
                      {method.terms.map((term, idx) => (
                        <div key={idx} className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{term}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Action Button */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">
                      Tersinkron otomatis pada Kontrak Digital Pasal 5
                    </span>
                    <button
                      onClick={() => setEditingMethod(method)}
                      className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-900 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <span>Ubah Ketentuan</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Rekening Bank Resmi */}
      {activeTab === 'banks' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900">Rekening Bank Resmi Perusahaan</h3>
              <p className="text-xs text-slate-500">
                Rekening tujuan transfer yang ditampilkan kepada pembeli saat checkout dan dicantumkan pada Kontrak Digital & Invoice.
              </p>
            </div>

            <button
              onClick={() => setIsAddingBank(true)}
              className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Rekening Bank</span>
            </button>
          </div>

          {/* Add Bank Form Modal / Card */}
          {isAddingBank && (
            <motion.form
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleAddBank}
              className="p-5 bg-blue-50/70 border-2 border-blue-200 rounded-2xl space-y-4 text-xs"
            >
              <div className="flex items-center justify-between border-b border-blue-200 pb-2">
                <h4 className="font-extrabold text-blue-950 text-sm flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-700" />
                  Tambah Akun Bank Baru
                </h4>
                <button
                  type="button"
                  onClick={() => setIsAddingBank(false)}
                  className="text-slate-400 hover:text-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Nama Bank *
                  </label>
                  <input
                    type="text"
                    required
                    value={newBank.bankName}
                    onChange={(e) => setNewBank({ ...newBank, bankName: e.target.value })}
                    placeholder="Contoh: Bank Mandiri / BCA / BNI / BRI / BSI"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Nomor Rekening *
                  </label>
                  <input
                    type="text"
                    required
                    value={newBank.accountNumber}
                    onChange={(e) => setNewBank({ ...newBank, accountNumber: e.target.value })}
                    placeholder="Contoh: 110-00-1849201-9"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 font-mono focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Atas Nama Rekening *
                  </label>
                  <input
                    type="text"
                    required
                    value={newBank.accountHolder}
                    onChange={(e) => setNewBank({ ...newBank, accountHolder: e.target.value })}
                    placeholder="PT. CAFTHEN INDO PROJECT / HENDRI PUTRA.S.Kom"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Kantor Cabang
                  </label>
                  <input
                    type="text"
                    value={newBank.branch}
                    onChange={(e) => setNewBank({ ...newBank, branch: e.target.value })}
                    placeholder="Contoh: KC Jambi Telanaipura"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Keterangan Rekening
                  </label>
                  <input
                    type="text"
                    value={newBank.notes}
                    onChange={(e) => setNewBank({ ...newBank, notes: e.target.value })}
                    placeholder="Contoh: Rekening Utama Operasional Pengadaan"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                    <input
                      type="checkbox"
                      checked={newBank.isPrimary}
                      onChange={(e) => setNewBank({ ...newBank, isPrimary: e.target.checked })}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                    />
                    <span>Jadikan Rekening Utama</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingBank(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-md"
                >
                  <Save className="w-4 h-4" /> Simpan Rekening
                </button>
              </div>
            </motion.form>
          )}

          {/* List of Bank Accounts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {paymentSettings.bankAccounts.map((bank) => (
              <div
                key={bank.id}
                className={`p-5 rounded-2xl border transition-all ${
                  bank.isPrimary
                    ? 'bg-gradient-to-br from-blue-50 to-indigo-50/50 border-blue-300 shadow-md ring-2 ring-blue-500/20'
                    : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-900 text-white flex items-center justify-center font-black shadow-xs">
                    <Building2 className="w-5 h-5" />
                  </div>
                  {bank.isPrimary ? (
                    <span className="px-2.5 py-0.5 bg-blue-900 text-amber-400 font-extrabold text-[10px] rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-amber-400" /> REKENING UTAMA
                    </span>
                  ) : (
                    <button
                      onClick={() => handleSetPrimaryBank(bank.id)}
                      className="text-[11px] font-bold text-blue-700 hover:text-blue-900 underline cursor-pointer"
                    >
                      Jadikan Utama
                    </button>
                  )}
                </div>

                <div className="space-y-1.5 mb-4">
                  <h4 className="font-extrabold text-slate-900 text-base">{bank.bankName}</h4>
                  <p className="font-mono font-black text-blue-900 text-lg tracking-wide">{bank.accountNumber}</p>
                  <p className="text-xs text-slate-700 font-medium">a/n <strong>{bank.accountHolder}</strong></p>
                  {bank.branch && (
                    <p className="text-[11px] text-slate-500">Cabang: {bank.branch}</p>
                  )}
                  {bank.notes && (
                    <p className="text-[11px] text-slate-600 italic bg-white/70 p-1.5 rounded border border-slate-200">
                      {bank.notes}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between">
                  <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Terverifikasi Resmi
                  </span>
                  <button
                    onClick={() => handleDeleteBank(bank.id)}
                    className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Hapus Rekening"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: QRIS Bank Indonesia */}
      {activeTab === 'qris' && (
        <div className="p-6 bg-white border border-slate-200 rounded-2xl space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900">Konfigurasi QRIS Merchant Bank Indonesia</h3>
              <p className="text-xs text-slate-500">
                Pindai instan untuk pembayaran 100% lunas yang mendukung seluruh Bank & Dompet Digital Nasional.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">Status QRIS:</span>
              <button
                onClick={() => {
                  const updated = {
                    ...paymentSettings,
                    qrisConfig: {
                      ...paymentSettings.qrisConfig,
                      enabled: !paymentSettings.qrisConfig.enabled
                    }
                  };
                  setPaymentSettings(updated);
                  StorageService.savePaymentSettings(updated);
                  onDataUpdated();
                  showSuccess(`QRIS ${updated.qrisConfig.enabled ? 'diaktifkan' : 'dinonaktifkan'}.`);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  paymentSettings.qrisConfig.enabled
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-300 text-slate-700'
                }`}
              >
                {paymentSettings.qrisConfig.enabled ? 'AKTIF' : 'NONAKTIF'}
              </button>
            </div>
          </div>

          <form onSubmit={handleSaveQRIS} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nama Merchant Resmi QRIS
                </label>
                <input
                  type="text"
                  required
                  value={paymentSettings.qrisConfig.merchantName}
                  onChange={(e) => setPaymentSettings({
                    ...paymentSettings,
                    qrisConfig: { ...paymentSettings.qrisConfig, merchantName: e.target.value }
                  })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  NMID (National Merchant ID)
                </label>
                <input
                  type="text"
                  required
                  value={paymentSettings.qrisConfig.nmid}
                  onChange={(e) => setPaymentSettings({
                    ...paymentSettings,
                    qrisConfig: { ...paymentSettings.qrisConfig, nmid: e.target.value }
                  })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 font-mono focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  URL Gambar Barcode QRIS Resmi
                </label>
                <input
                  type="url"
                  required
                  value={paymentSettings.qrisConfig.qrisImageUrl}
                  onChange={(e) => setPaymentSettings({
                    ...paymentSettings,
                    qrisConfig: { ...paymentSettings.qrisConfig, qrisImageUrl: e.target.value }
                  })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 font-mono text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Tempelkan tautan gambar barcode QRIS resmi PT. CAFTHEN INDO PROJECT yang diterbitkan oleh Bank/Acquirer.
                </span>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md cursor-pointer"
                >
                  <Save className="w-4 h-4" /> Simpan Pengaturan QRIS
                </button>
              </div>
            </div>

            {/* QRIS Live Preview Box */}
            <div className="p-5 bg-slate-50 border border-slate-300 rounded-2xl flex flex-col items-center justify-center text-center">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                Pratinjau QRIS di Kasir Konsumen
              </span>

              <div className="p-3 bg-white border-2 border-slate-900 rounded-xl shadow-md flex flex-col items-center max-w-[220px]">
                <div className="w-10 h-4 bg-rose-600 text-white font-black text-[9px] rounded flex items-center justify-center mb-2">
                  QRIS
                </div>
                <img
                  src={paymentSettings.qrisConfig.qrisImageUrl}
                  alt="QRIS Barcode"
                  className="w-40 h-40 object-contain rounded-lg border border-slate-200 p-1"
                />
                <span className="font-extrabold text-xs text-slate-950 mt-2">
                  {paymentSettings.qrisConfig.merchantName}
                </span>
                <span className="text-[9px] text-slate-500 font-mono">
                  NMID: {paymentSettings.qrisConfig.nmid}
                </span>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Tab 4: Ketentuan & Waktu Jatuh Tempo */}
      {activeTab === 'terms' && (
        <div className="p-6 bg-white border border-slate-200 rounded-2xl space-y-6 shadow-sm">
          <div>
            <h3 className="font-bold text-base text-slate-900">Ketentuan Global & Batas Waktu Pembayaran</h3>
            <p className="text-xs text-slate-500">
              Konfigurasi kebijakan jatuh tempo pelunasan invoice dan ketentuan umum yang tercantum dalam SPJB digital.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-4">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Batas Waktu Pelunasan Down Payment / Invoice (Jam)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={168}
                    value={paymentSettings.duePaymentHours || 24}
                    onChange={(e) => {
                      const updated = {
                        ...paymentSettings,
                        duePaymentHours: Number(e.target.value) || 24
                      };
                      setPaymentSettings(updated);
                      StorageService.savePaymentSettings(updated);
                    }}
                    className="w-32 px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 font-bold focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                  <span className="text-slate-600 font-medium">Jam (Standar: 24 Jam / 1 Hari Kerja)</span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Syarat Minimum Transaksi untuk Letter of Credit (IDR)
                </label>
                <p className="p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-blue-900 text-sm">
                  {formatIDR(200000000)} (Dua Ratus Juta Rupiah)
                </p>
              </div>
            </div>

            <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-2xl space-y-3">
              <span className="font-bold text-blue-950 block text-sm flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-700" />
                Ketentuan Hukum Perlindungan Transaksi
              </span>
              <ul className="space-y-2 text-[11px] text-slate-700 leading-relaxed list-disc list-inside">
                <li>Seluruh transaksi tercatat secara otomatis pada buku besar keuangan kasir dan laporan laba rugi admin.</li>
                <li>Setiap penerimaan pembayaran DP menghasilkan status 'DP Terverifikasi' dan membuka antrian pemuatan armada.</li>
                <li>Faktur pajak resmi e-Faktur diterbitkan melalui sistem ECoretax DJP sesuai tarif PPN 11% & PPh 22/23.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Edit Method Modal */}
      {editingMethod && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-3xl lg:max-w-4xl bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl space-y-4 text-xs max-h-[95vh] flex flex-col overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="font-mono text-blue-900 font-black text-xs">{editingMethod.code}</span>
                <h3 className="font-extrabold text-slate-900 text-base">Ubah Pengaturan Skema</h3>
              </div>
              <button
                onClick={() => setEditingMethod(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Tampilan Skema</label>
                <input
                  type="text"
                  value={editingMethod.name}
                  onChange={(e) => setEditingMethod({ ...editingMethod, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Deskripsi Singkat</label>
                <textarea
                  rows={2}
                  value={editingMethod.description}
                  onChange={(e) => setEditingMethod({ ...editingMethod, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Badge Label (Opsional)</label>
                <input
                  type="text"
                  value={editingMethod.badge || ''}
                  onChange={(e) => setEditingMethod({ ...editingMethod, badge: e.target.value })}
                  placeholder="Contoh: TERPOPULER / REKOMENDASI"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 uppercase font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Instruksi Pembayaran</label>
                <textarea
                  rows={3}
                  value={editingMethod.instructions}
                  onChange={(e) => setEditingMethod({ ...editingMethod, instructions: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-slate-900"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingMethod(null)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleSaveMethodEdit(editingMethod)}
                className="px-5 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl font-bold shadow-md flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" /> Simpan Perubahan
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
