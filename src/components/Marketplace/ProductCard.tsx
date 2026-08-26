import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Package, 
  MapPin, 
  Receipt, 
  ShoppingCart, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Sparkles,
  Info,
  Truck,
  Ship,
  Layers,
  CheckCircle2
} from 'lucide-react';
import { Product, PurchasePattern } from '../../types';
import { formatIDR, formatUSD } from '../../utils/formatters';
import { PURCHASE_PATTERNS_INFO, getProductPatternPrice } from '../../utils/pricing';

interface ProductCardProps {
  product: Product;
  exchangeRate: number;
  currency: 'IDR' | 'USD';
  onBuyClick: (product: Product, selectedPattern: PurchasePattern) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  exchangeRate,
  currency,
  onBuyClick
}) => {
  const [currentImgIdx, setCurrentImgIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [selectedPattern, setSelectedPattern] = useState<PurchasePattern>('Franco');

  // Auto-slide gallery on hover or periodically
  useEffect(() => {
    if (!isHovered || product.images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImgIdx((prev) => (prev + 1) % product.images.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [isHovered, product.images.length]);

  const activePricing = getProductPatternPrice(product, selectedPattern, exchangeRate);
  const patternInfo = PURCHASE_PATTERNS_INFO[selectedPattern];

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImgIdx((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImgIdx((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group relative"
    >
      {/* Image Gallery Header with slide & controls */}
      <div className="relative aspect-[4/3] bg-slate-950 overflow-hidden">
        <img
          src={product.images[currentImgIdx] || product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Gradient Overlay for badges */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/30 pointer-events-none" />

        {/* Origin / Asal Produk Badge */}
        <div className="absolute top-3 left-3 px-2.5 py-1 bg-slate-900/85 backdrop-blur-sm text-white text-[11px] font-semibold rounded-lg flex items-center gap-1 shadow">
          <MapPin className="w-3 h-3 text-amber-400" />
          <span>{product.origin}</span>
        </div>

        {/* ECoretax Badge */}
        <div className="absolute top-3 right-3 px-2.5 py-1 bg-blue-900/85 backdrop-blur-sm text-white text-[11px] font-semibold rounded-lg flex items-center gap-1 shadow">
          <Receipt className="w-3 h-3 text-blue-300" />
          <span>ECoretax: {product.ecoretaxType}</span>
        </div>

        {/* Carousel controls if multi images */}
        {product.images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1">
              {product.images.map((_, idx) => (
                <span
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    currentImgIdx === idx ? 'bg-amber-400 w-3' : 'bg-white/60'
                  }`}
                />
              ))}
            </div>
          </>
        )}

        {/* Category tag */}
        <div className="absolute bottom-2.5 left-3">
          <span className="px-2 py-0.5 bg-blue-600/90 text-white text-[10px] font-bold uppercase tracking-wider rounded">
            {product.category}
          </span>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-3">
          <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-blue-700 transition-colors line-clamp-2">
            {product.name}
          </h3>

          {/* Interactive Purchase Pattern Selector (LOCO, FOB, FRANCO, CIF) */}
          <div className="space-y-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-slate-700">Pilihan Pola Pembelian:</span>
              <span className="text-[10px] text-blue-900 font-extrabold uppercase bg-blue-100/80 px-1.5 py-0.2 rounded">
                {selectedPattern}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-1">
              {(['Loco', 'FOB', 'Franco', 'CIF'] as PurchasePattern[]).map((pattern) => {
                const isSelected = selectedPattern === pattern;
                return (
                  <button
                    key={pattern}
                    type="button"
                    onClick={() => setSelectedPattern(pattern)}
                    className={`py-1.5 px-1 rounded-lg text-center font-bold text-[11px] transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-900 text-white shadow-xs scale-[1.02]'
                        : 'bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200'
                    }`}
                  >
                    {pattern.toUpperCase()}
                  </button>
                );
              })}
            </div>

            {/* Pattern Delivery Point Summary */}
            <div className="text-[10.5px] text-slate-600 flex items-center gap-1 pt-0.5">
              <Info className="w-3 h-3 text-blue-600 shrink-0" />
              <span className="line-clamp-1">{patternInfo.deliveryPoint}</span>
            </div>
          </div>

          {/* Pricing Highlight for Selected Pattern */}
          <div className="p-3 bg-gradient-to-br from-slate-900 to-blue-950 text-white rounded-xl shadow-xs">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider block">
                  Harga Sistem {selectedPattern.toUpperCase()}:
                </span>
                <span className="text-base sm:text-lg font-black text-white font-mono">
                  {formatIDR(activePricing.priceIDR)}
                </span>
                <span className="text-xs text-slate-300 font-medium ml-1">/{product.unit}</span>
              </div>

              <div className="text-right border-l border-white/15 pl-3">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                  Kurs USD ($):
                </span>
                <span className="text-sm font-bold text-emerald-400 font-mono">
                  {formatUSD(activePricing.priceUSD)}
                </span>
                <span className="text-[9px] text-slate-400 block font-mono">
                  (1$ ≈ Rp{exchangeRate.toLocaleString('id-ID')})
                </span>
              </div>
            </div>
          </div>

          {/* Stock Info */}
          <div className="flex items-center justify-between text-xs text-slate-600 px-1">
            <span className="flex items-center gap-1 font-medium">
              <Package className="w-3.5 h-3.5 text-slate-400" /> Stok Tersedia:
            </span>
            <span className="font-bold text-slate-900">
              {product.stock.toLocaleString('id-ID')} {product.unit}
            </span>
          </div>

          {/* Point-by-point specifications */}
          <div className="pt-2 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-700 block mb-1.5">
              Keterangan & Spesifikasi Teknis:
            </span>
            <ul className="text-xs text-slate-600 space-y-1">
              {product.specs.slice(0, 2).map((spec, idx) => (
                <li key={idx} className="flex items-start gap-1.5 leading-tight">
                  <Check className="w-3 h-3 text-blue-600 shrink-0 mt-0.5" />
                  <span className="line-clamp-1">{spec}</span>
                </li>
              ))}
              {product.specs.length > 2 && (
                <li className="text-[11px] text-blue-600 font-medium pt-0.5">
                  + {product.specs.length - 2} spesifikasi teknis lainnya
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => onBuyClick(product, selectedPattern)}
          className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 hover:from-blue-800 hover:to-indigo-800 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
        >
          <ShoppingCart className="w-4 h-4 text-amber-300" /> 
          <span>Pesan Sekarang ({selectedPattern.toUpperCase()})</span>
        </button>
      </div>
    </motion.div>
  );
};
