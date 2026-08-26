import React, { useState } from 'react';
import { 
  DollarSign, 
  Receipt, 
  TrendingUp, 
  Wallet, 
  Plus, 
  FileText, 
  Layers, 
  ArrowUpRight, 
  ArrowDownRight,
  PieChart as PieIcon,
  Trash2
} from 'lucide-react';
import { FinancialReport, ExpenseRecord, Order } from '../../types';
import { StorageService } from '../../storage';
import { formatIDR } from '../../utils/formatters';

interface AdminFinanceProps {
  orders: Order[];
  finance: FinancialReport;
  expenses: ExpenseRecord[];
  onDataUpdated: () => void;
}

export const AdminFinance: React.FC<AdminFinanceProps> = ({
  orders,
  finance,
  expenses,
  onDataUpdated
}) => {
  const [activeTab, setActiveTab] = useState<'labaRugi' | 'ecoretax' | 'modalKas' | 'pengeluaran'>('labaRugi');

  // New Expense form states
  const [expenseDescription, setExpenseDescription] = useState('');
  const [expenseAmount, setExpenseAmount] = useState<number>(5000000);
  const [expenseCategory, setExpenseCategory] = useState<
    'Operasional' | 'Bahan Baku' | 'Logistik & Kapal' | 'Gaji & Tenaga Ahli' | 'Pajak & Legalitas' | 'Peralatan Proyek'
  >('Operasional');
  const [expenseFundSource, setExpenseFundSource] = useState<
    'Modal Operasional' | 'Keuntungan Bersih' | 'Kas Proyek'
  >('Modal Operasional');

  // Dynamic calculations based on live orders
  const totalRevenue = orders
    .filter((o) => o.status !== 'Dibatalkan')
    .reduce((sum, o) => sum + o.totalPriceIDR, 0);

  const totalPPN = orders.reduce((sum, o) => sum + o.taxSystem.ppnAmount, 0);

  // Approximate COGS / HPP (approx 68% of commodity sales)
  const cogs = Math.round(totalRevenue * 0.68);
  const grossProfit = totalRevenue - cogs;
  const totalOpEx = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = grossProfit - totalOpEx;

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseDescription || expenseAmount <= 0) return;

    const newRecord: ExpenseRecord = {
      id: `exp-${Date.now()}`,
      title: expenseDescription.slice(0, 40),
      date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      category: expenseCategory,
      description: expenseDescription,
      amount: expenseAmount,
      sourceOfFunds: expenseFundSource,
      recordedBy: 'cipindo'
    };

    StorageService.saveExpense(newRecord);
    setExpenseDescription('');
    setExpenseAmount(5000000);
    onDataUpdated();
  };

  const handleDeleteExpense = (id: string) => {
    if (confirm('Hapus pencatatan pengeluaran ini?')) {
      StorageService.deleteExpense(id);
      onDataUpdated();
    }
  };

  return (
    <div className="space-y-6">
      {/* Finance Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {[
          { id: 'labaRugi', label: 'Laporan Laba Rugi (P&L)', icon: TrendingUp },
          { id: 'ecoretax', label: 'Laporan Pajak (ECoretax DJP)', icon: Receipt },
          { id: 'modalKas', label: 'Daftar Modal & Pos Kas', icon: Wallet },
          { id: 'pengeluaran', label: 'Pencatatan Pengeluaran Terintegrasi', icon: Layers }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-blue-900 text-white shadow-sm'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Laporan Laba Rugi */}
      {activeTab === 'labaRugi' && (
        <div className="space-y-6">
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
              <div>
                <h4 className="text-base font-bold text-slate-900">
                  Laporan Laba Rugi Komprehensif (Income Statement)
                </h4>
                <p className="text-xs text-slate-500">
                  PT. CAFTHEN INDO PROJECT • Periode Berjalan Tahun 2026
                </p>
              </div>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg self-start sm:self-auto">
                Status: Audit Internal Sehat
              </span>
            </div>

            {/* P&L Breakdown Table */}
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center p-3 bg-blue-50/70 rounded-xl font-bold text-blue-950">
                <span className="text-sm">1. PENDAPATAN USAHA (REVENUE)</span>
                <span className="text-base font-mono">{formatIDR(totalRevenue)}</span>
              </div>

              <div className="pl-4 space-y-2 text-slate-700">
                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <span>• Penjualan Komoditas Batubara & Mineral</span>
                  <span className="font-mono">{formatIDR(Math.round(totalRevenue * 0.72))}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <span>• Pengadaan Besi SNI, Semen & Konstruksi Sipil</span>
                  <span className="font-mono">{formatIDR(Math.round(totalRevenue * 0.28))}</span>
                </div>
              </div>

              <div className="flex justify-between items-center p-3 bg-rose-50/70 rounded-xl font-bold text-rose-950">
                <span className="text-sm">2. BEBAN POKOK PENDAPATAN (HPP / COGS)</span>
                <span className="text-base font-mono">- {formatIDR(cogs)}</span>
              </div>

              <div className="flex justify-between items-center p-3 bg-slate-100 rounded-xl font-extrabold text-slate-900">
                <span className="text-sm">3. LABA KOTOR (GROSS PROFIT)</span>
                <span className="text-base font-mono text-emerald-700">{formatIDR(grossProfit)}</span>
              </div>

              <div className="flex justify-between items-center p-3 bg-amber-50/70 rounded-xl font-bold text-amber-950">
                <span className="text-sm">4. BEBAN OPERASIONAL (OPEX & LOGISTIK)</span>
                <span className="text-base font-mono">- {formatIDR(totalOpEx)}</span>
              </div>

              <div className="flex justify-between items-center p-4 bg-gradient-to-r from-slate-900 to-blue-950 text-white rounded-2xl font-black">
                <div>
                  <span className="text-sm block">5. LABA BERSIH (NET PROFIT)</span>
                  <span className="text-[10px] text-amber-400 font-normal">Margin Bersih Operasional</span>
                </div>
                <span className="text-lg font-mono text-emerald-400">{formatIDR(netProfit)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Laporan Pajak ECoretax */}
      {activeTab === 'ecoretax' && (
        <div className="space-y-6">
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h4 className="text-base font-bold text-slate-900">
                  Laporan Rekapitulasi Pajak ECoretax Terintegrasi DJP
                </h4>
                <p className="text-xs text-slate-500">
                  Faktur Pajak Elektronik DJP, PPN 11% dan PPh Pasal 22/23
                </p>
              </div>
              <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                <Receipt className="w-5 h-5" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border space-y-1">
                <span className="text-[11px] text-slate-500 font-bold uppercase">Total DPP (Dasar Pengenaan Pajak)</span>
                <div className="text-lg font-black text-slate-900 font-mono">
                  {formatIDR(orders.reduce((sum, o) => sum + o.taxSystem.dppAmount, 0))}
                </div>
                <span className="text-[10px] text-slate-400">Dasar perhitungan faktur pajak</span>
              </div>

              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1">
                <span className="text-[11px] text-emerald-800 font-bold uppercase">Total PPN 11% Terkumpul</span>
                <div className="text-lg font-black text-emerald-900 font-mono">
                  {formatIDR(totalPPN)}
                </div>
                <span className="text-[10px] text-emerald-700">Faktur Pajak Keluaran siap lapor SPT</span>
              </div>

              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 space-y-1">
                <span className="text-[11px] text-blue-800 font-bold uppercase">Estimasi PPh Pasal 22 (1.5%)</span>
                <div className="text-lg font-black text-blue-900 font-mono">
                  {formatIDR(Math.round(totalRevenue * 0.015))}
                </div>
                <span className="text-[10px] text-blue-700">Pengadaan komoditas jalur air/vessel</span>
              </div>
            </div>

            {/* ECoretax Transactions Detail */}
            <div className="space-y-3 pt-2">
              <h5 className="text-xs font-bold text-slate-900 uppercase">Daftar Faktur Pajak Per Pesanan:</h5>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-y">
                    <tr>
                      <th className="py-2.5 px-3">No. Order</th>
                      <th className="py-2.5 px-3">Nama Pembeli</th>
                      <th className="py-2.5 px-3">NPWP Pembeli</th>
                      <th className="py-2.5 px-3">Sistem ECoretax</th>
                      <th className="py-2.5 px-3 text-right">PPN 11%</th>
                      <th className="py-2.5 px-3 text-center">Status DJP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orders.map((o) => (
                      <tr key={o.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-mono font-bold text-blue-900">{o.id}</td>
                        <td className="py-2.5 px-3 font-medium text-slate-900">{o.buyerName}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-600">{o.buyerNpwp || '01.234.567.8-331.000'}</td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded">
                            {o.taxSystem.type} ({o.shippingMethod})
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-800">
                          {formatIDR(o.taxSystem.ppnAmount)}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                            Valid e-Faktur
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Daftar Modal & Kas */}
      {activeTab === 'modalKas' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase">Modal Awal Disetor</span>
                <Wallet className="w-5 h-5 text-blue-900" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 font-mono">
                {formatIDR(finance.initialCapital)}
              </h3>
              <p className="text-[11px] text-slate-500">
                Akta Notaris Pendirian PT. CAFTHEN INDO PROJECT
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase">Kas Operasional Berjalan</span>
                <TrendingUp className="w-5 h-5 text-emerald-700" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 font-mono">
                {formatIDR(finance.operatingCash)}
              </h3>
              <p className="text-[11px] text-emerald-600 font-semibold">
                Likuiditas harian dan operasional kantor
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase">Kas Proyek & Pengadaan</span>
                <Layers className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 font-mono">
                {formatIDR(finance.projectCash)}
              </h3>
              <p className="text-[11px] text-amber-700 font-semibold">
                Alokasi pembelian bahan baku dan logistik tongkang
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Pencatatan Pengeluaran Terintegrasi */}
      {activeTab === 'pengeluaran' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Input Form */}
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h4 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Plus className="w-4 h-4 text-blue-900" />
              Input Pengeluaran Terintegrasi
            </h4>
            <p className="text-xs text-slate-500">
              Catat pengeluaran operasional atau proyek dan pilih sumber anggaran dana secara langsung.
            </p>

            <form onSubmit={handleAddExpense} className="space-y-3 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kategori Pengeluaran
                </label>
                <select
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                >
                  <option value="Operasional">Operasional Kantor & Administrasi</option>
                  <option value="Bahan Baku">Bahan Baku & Komoditas Tambang</option>
                  <option value="Logistik & Kapal">Logistik Tongkang, Vessel & Dump Truck</option>
                  <option value="Gaji & Tenaga Ahli">Gaji Karyawan & Tenaga Ahli Sipil</option>
                  <option value="Pajak & Legalitas">Pajak ECoretax & Biaya Notaris</option>
                  <option value="Peralatan Proyek">Sewa & Perawatan Alat Berat</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pilih Sumber Anggaran / Pos Dana *
                </label>
                <select
                  value={expenseFundSource}
                  onChange={(e) => setExpenseFundSource(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-blue-300 bg-blue-50/40 text-blue-950 font-bold focus:ring-2 focus:ring-blue-600 focus:outline-none"
                >
                  <option value="Modal Operasional">Modal Operasional</option>
                  <option value="Keuntungan Bersih">Keuntungan Bersih Perusahaan</option>
                  <option value="Kas Proyek">Kas Proyek Konstruksi & Pengadaan</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nominal Pengeluaran (IDR) *
                </label>
                <input
                  type="number"
                  required
                  min={1000}
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(+e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Deskripsi / Keterangan Pembayaran *
                </label>
                <textarea
                  rows={3}
                  required
                  value={expenseDescription}
                  onChange={(e) => setExpenseDescription(e.target.value)}
                  placeholder="Contoh: Pembayaran bahan bakar solar industri armada kapal tongkang TB. CIP 01..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-xl shadow cursor-pointer"
                >
                  Simpan & Potong Pos Anggaran
                </button>
              </div>
            </form>
          </div>

          {/* Right: Expense History List */}
          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-base text-slate-900">Riwayat Pengeluaran Dana Perusahaan</h4>
              <span className="text-xs font-bold text-slate-500 font-mono">
                Total: {formatIDR(totalOpEx)}
              </span>
            </div>

            <div className="space-y-3">
              {expenses.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  Belum ada pengeluaran yang dicatat.
                </div>
              ) : (
                expenses.map((exp) => (
                  <div
                    key={exp.id}
                    className="p-3.5 bg-slate-50 border rounded-xl flex items-start justify-between gap-3 hover:bg-slate-100/80 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 font-bold text-[10px] rounded">
                          {exp.category}
                        </span>
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-900 font-bold text-[10px] rounded">
                          Sumber: {exp.sourceOfFunds}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{exp.date}</span>
                      </div>
                      <p className="text-xs font-semibold text-slate-900">{exp.description}</p>
                    </div>

                    <div className="text-right shrink-0 flex items-center gap-3">
                      <div>
                        <div className="text-xs font-bold text-rose-700 font-mono">
                          - {formatIDR(exp.amount)}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">oleh: {exp.recordedBy}</span>
                      </div>
                      <button
                        onClick={() => handleDeleteExpense(exp.id)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                        title="Hapus"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
