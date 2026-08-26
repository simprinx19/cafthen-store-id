import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { 
  DollarSign, 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  Receipt, 
  Truck, 
  Ship, 
  ShieldCheck, 
  CheckCircle2 
} from 'lucide-react';
import { Order, UserProfile, Product, ExpenseRecord } from '../../types';
import { formatIDR, formatUSD } from '../../utils/formatters';

interface AdminOverviewProps {
  orders: Order[];
  users: UserProfile[];
  products: Product[];
  expenses: ExpenseRecord[];
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({
  orders,
  users,
  products,
  expenses
}) => {
  const totalRevenue = orders
    .filter((o) => o.status !== 'Dibatalkan')
    .reduce((sum, o) => sum + o.totalPriceIDR, 0);

  const totalTax = orders.reduce((sum, o) => sum + o.taxSystem.ppnAmount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const verifiedUsersCount = users.filter((u) => u.status === 'Verified').length;
  const pendingUsersCount = users.filter((u) => u.status === 'Pending').length;

  // Chart Data: Monthly Performance Simulation
  const salesMonthlyData = [
    { month: 'Mar', penjualan: 1450000000, pengadaan: 980000000, pajak: 159500000 },
    { month: 'Apr', penjualan: 2100000000, pengadaan: 1400000000, pajak: 231000000 },
    { month: 'Mei', penjualan: 1850000000, pengadaan: 1200000000, pajak: 203500000 },
    { month: 'Jun', penjualan: 2900000000, pengadaan: 1850000000, pajak: 319000000 },
    { month: 'Jul', penjualan: 3450000000, pengadaan: 2200000000, pajak: 379500000 },
    { month: 'Agu', penjualan: totalRevenue || 3471525000, pengadaan: 2350000000, pajak: totalTax || 344025000 }
  ];

  // Purchase Pattern Breakdown
  const patternStats = [
    { name: 'FOB (Tongkang/Vessel)', value: orders.filter((o) => o.purchasePattern === 'FOB').length || 3, color: '#1e3a8a' },
    { name: 'Franco (Diantar)', value: orders.filter((o) => o.purchasePattern === 'Franco').length || 4, color: '#0284c7' },
    { name: 'Loco (Ambil Sendiri)', value: orders.filter((o) => o.purchasePattern === 'Loco').length || 2, color: '#f59e0b' },
    { name: 'CIF (Asuransi & Freight)', value: orders.filter((o) => o.purchasePattern === 'CIF').length || 1, color: '#10b981' }
  ];

  // Shipping Method Stats
  const shippingStats = [
    { name: 'Trucking (Darat)', armada: 18, orderCount: orders.filter((o) => o.shippingMethod === 'Trucking').length },
    { name: 'Tongkang 300ft (Sungai)', armada: 6, orderCount: orders.filter((o) => o.shippingMethod === 'Tongkang').length },
    { name: 'Mother Vessel (Laut)', armada: 2, orderCount: orders.filter((o) => o.shippingMethod === 'Mother Vessel').length }
  ];

  return (
    <div className="space-y-6">
      {/* 4 Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Omzet Penjualan</span>
            <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-xl font-black text-slate-900 font-mono">
            {formatIDR(totalRevenue)}
          </h3>
          <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Transaksi Terikat Kontrak Digital
          </p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Pesanan Masuk</span>
            <div className="p-2 bg-amber-100 text-amber-700 rounded-xl">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-xl font-black text-slate-900 font-mono">
            {orders.length} <span className="text-xs font-normal text-slate-500">Transaksi</span>
          </h3>
          <p className="text-[11px] text-slate-500">
            {orders.filter((o) => o.status === 'Dalam Pengiriman' || o.status === 'Pemuatan Barang (Loading)').length} Pesanan dalam proses logistik
          </p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Akun Pembeli Terdaftar</span>
            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-xl font-black text-slate-900 font-mono">
            {users.length} <span className="text-xs font-normal text-slate-500">User</span>
          </h3>
          <p className="text-[11px] text-blue-600 font-semibold">
            {verifiedUsersCount} Terverifikasi • {pendingUsersCount} Menunggu Verifikasi
          </p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Rekap ECoretax DJP</span>
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-xl font-black text-slate-900 font-mono">
            {formatIDR(totalTax)}
          </h3>
          <p className="text-[11px] text-emerald-600 font-semibold">
            PPN 11% Faktur DJP Terbit
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sales Trend Area Chart */}
        <div className="lg:col-span-8 p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-slate-900 text-base">Tren Penjualan & Pengadaan Bulanan</h4>
              <p className="text-xs text-slate-500">Data performa omzet dan realisasi kontrak PT. CAFTHEN INDO PROJECT</p>
            </div>
            <span className="text-xs font-mono bg-blue-50 text-blue-800 font-bold px-2.5 py-1 rounded-lg">
              2026 Live Analytics
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesMonthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1e3a8a" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#1e3a8a" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorProc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={10} tickFormatter={(val) => `${(val / 1000000).toFixed(0)}jt`} />
                <Tooltip
                  formatter={(val: number) => [formatIDR(val), '']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="penjualan" name="Total Penjualan" stroke="#1e3a8a" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSales)" />
                <Area type="monotone" dataKey="pengadaan" name="Realisasi Pengadaan" stroke="#0284c7" strokeWidth={2} fillOpacity={1} fill="url(#colorProc)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Purchase Pattern Breakdown (Donut Chart) */}
        <div className="lg:col-span-4 p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <h4 className="font-bold text-slate-900 text-base">Distribusi Pola Pembelian</h4>
            <p className="text-xs text-slate-500">Komposisi skema Loco, FOB, Franco & CIF</p>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={patternStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {patternStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: number, name: string) => [`${val} Transaksi`, name]} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-100">
            {patternStats.map((item, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-slate-700 truncate">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
