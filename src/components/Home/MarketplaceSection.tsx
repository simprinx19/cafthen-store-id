import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  Sparkles, 
  Receipt, 
  FileCheck2, 
  Layers, 
  DollarSign,
  PackageSearch
} from 'lucide-react';
import { Product, ProductCategory, UserProfile, Order, PurchasePattern } from '../../types';
import { ProductCard } from '../Marketplace/ProductCard';
import { CheckoutModal } from '../Marketplace/CheckoutModal';

interface MarketplaceSectionProps {
  products: Product[];
  exchangeRate: number;
  currency: 'IDR' | 'USD';
  currentUser: UserProfile | null;
  onRequireAuth: () => void;
  onOrderSuccess: (order: Order) => void;
  onNavigateToDashboard?: () => void;
}

export const MarketplaceSection: React.FC<MarketplaceSectionProps> = ({
  products,
  exchangeRate,
  currency,
  currentUser,
  onRequireAuth,
  onOrderSuccess,
  onNavigateToDashboard
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedPattern, setSelectedPattern] = useState<PurchasePattern>('Franco');

  const categories = [
    'Semua',
    'Perdagangan Komoditas & Mineral',
    'Konstruksi Sipil & Material',
    'Pengadaan Alat & Logistik',
    'Jasa Kontraktor & Engineering'
  ];

  const filteredProducts = products.filter((p) => {
    const matchCat = selectedCategory === 'Semua' || p.category === selectedCategory;
    const matchSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <section id="marketplace-produk" className="py-14 sm:py-20 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-10 gap-4 sm:gap-6">
          <div className="space-y-2">
            <span className="inline-block px-3 py-1 bg-amber-100 text-amber-900 font-bold text-[11px] sm:text-xs rounded-full uppercase tracking-wider">
              MARKETPLACE & E-COMMERCE PENGADAAN
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
              Katalog Produk & Komoditas Unggulan
            </h2>
            <p className="text-slate-600 text-xs sm:text-base max-w-2xl leading-relaxed">
              Pesan komoditas batubara, besi beton SNI, semen curah, agregat, dan rental alat berat dengan skema pembayaran fleksibel (50:50, 50:40:10, LC, QRIS) dan Kontrak Digital Otomatis.
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72 shrink-0">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari komoditas, besi, semen..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none bg-slate-50 text-slate-900"
            />
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-6 sm:mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-blue-900 text-white shadow-md'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Feature info banner */}
        <div className="mb-8 p-3.5 sm:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs text-blue-950">
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-blue-700 shrink-0" />
            <span className="leading-relaxed">
              <strong>Digital Contract Engine:</strong> Saat menekan tombol pemesanan, sistem secara otomatis menerbitkan Surat Perjanjian Jual Beli sah dengan Tanda Tangan Elektronik & QR Seal Direksi.
            </span>
          </div>
          <div className="flex items-center gap-2 text-slate-600 text-[11px] sm:text-xs">
            <Receipt className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>ECoretax DJP PPN 11% & PPh Terintegrasi</span>
          </div>
        </div>

        {/* Product Cards Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-14 sm:py-16 bg-slate-50 rounded-3xl border border-dashed border-slate-300 px-4">
            <PackageSearch className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base sm:text-lg font-bold text-slate-700">Produk Tidak Ditemukan</h3>
            <p className="text-xs text-slate-500 mt-1">Coba kata kunci pencarian lain atau pilih kategori Semua.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                exchangeRate={exchangeRate}
                currency={currency}
                onBuyClick={(prod, pattern) => {
                  setSelectedProduct(prod);
                  setSelectedPattern(pattern);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Checkout Modal */}
      {selectedProduct && (
        <CheckoutModal
          isOpen={Boolean(selectedProduct)}
          onClose={() => setSelectedProduct(null)}
          product={selectedProduct}
          initialPattern={selectedPattern}
          currentUser={currentUser}
          onRequireAuth={onRequireAuth}
          onOrderSuccess={onOrderSuccess}
          onNavigateToDashboard={onNavigateToDashboard}
        />
      )}
    </section>
  );
};
