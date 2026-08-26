import React, { useState } from 'react';
import { 
  Package, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  DollarSign, 
  Receipt, 
  Image as ImageIcon,
  MapPin,
  Sparkles,
  X,
  Truck,
  Ship,
  Anchor,
  Layers,
  Calculator,
  Info,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { Product, ProductCategory, PurchasePattern, PatternPricing } from '../../types';
import { StorageService } from '../../storage';
import { formatIDR, formatUSD } from '../../utils/formatters';
import { GOOGLE_USD_IDR_SEARCH_URL, ExchangeRateService } from '../../services/exchangeRateService';
import { PURCHASE_PATTERNS_INFO, getProductPatternPrice, calculateDefaultPatternPrices } from '../../utils/pricing';

interface AdminProductManagementProps {
  products: Product[];
  exchangeRate: number;
  onDataUpdated: () => void;
}

export const AdminProductManagement: React.FC<AdminProductManagementProps> = ({
  products,
  exchangeRate,
  onDataUpdated
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isRefreshingRate, setIsRefreshingRate] = useState(false);

  const handleSyncRate = async () => {
    setIsRefreshingRate(true);
    await ExchangeRateService.fetchLiveRate();
    setTimeout(() => setIsRefreshingRate(false), 500);
    onDataUpdated();
  };

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ProductCategory>('Perdagangan Komoditas & Mineral');
  const [priceIDR, setPriceIDR] = useState<number>(1000000);
  const [unit, setUnit] = useState('Ton');
  const [stock, setStock] = useState<number>(5000);
  const [origin, setOrigin] = useState('Tambang Muaro Jambi - Jambi');
  const [description, setDescription] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([
    'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=80'
  ]);
  const [currentImageInput, setCurrentImageInput] = useState('');
  const [specs, setSpecs] = useState<string[]>([
    'Spesifikasi mutu sesuai standar industri SNI / ASTM',
    'Sertifikat Surveyor Sucofindo / Carsurin tersedia'
  ]);
  const [currentSpecInput, setCurrentSpecInput] = useState('');
  const [ecoretaxType, setEcoretaxType] = useState<'Include' | 'Exclude'>('Include');

  // Purchase Pattern Pricing states (LOCO, FOB, FRANCO, CIF)
  const [locoPriceIDR, setLocoPriceIDR] = useState<number>(890000);
  const [locoDesc, setLocoDesc] = useState<string>('Pengambilan mandiri di stockpile/gudang tambang');
  
  const [fobPriceIDR, setFobPriceIDR] = useState<number>(980000);
  const [fobDesc, setFobDesc] = useState<string>('FOB Tongkang di dermaga pelabuhan muat asal');
  
  const [francoPriceIDR, setFrancoPriceIDR] = useState<number>(1120000);
  const [francoDesc, setFrancoDesc] = useState<string>('Franco diantar sampai titik lokasi proyek/gudang pembeli');
  
  const [cifPriceIDR, setCifPriceIDR] = useState<number>(1250000);
  const [cifDesc, setCifDesc] = useState<string>('CIF Pelabuhan tujuan termasuk premi asuransi & pelayaran kargo');

  const [activeFormTab, setActiveFormTab] = useState<'general' | 'pricing' | 'media_specs'>('pricing');

  const openAddModal = () => {
    setEditingProduct(null);
    setName('');
    setCategory('Perdagangan Komoditas & Mineral');
    setPriceIDR(1000000);
    setUnit('Ton');
    setStock(10000);
    setOrigin('Muaro Jambi - Jambi');
    setDescription('Pasokan material berkualitas tinggi dengan jaminan suplai berkelanjutan.');
    setImageUrls(['https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=80']);
    setSpecs(['Standar Mutu Terjamin', 'Pengiriman Cepat']);
    setEcoretaxType('Include');

    // Default 4 pattern prices
    const defaults = calculateDefaultPatternPrices(1000000, exchangeRate, 'Perdagangan Komoditas & Mineral');
    setLocoPriceIDR(defaults.Loco.priceIDR);
    setLocoDesc(defaults.Loco.description || '');
    setFobPriceIDR(defaults.FOB.priceIDR);
    setFobDesc(defaults.FOB.description || '');
    setFrancoPriceIDR(defaults.Franco.priceIDR);
    setFrancoDesc(defaults.Franco.description || '');
    setCifPriceIDR(defaults.CIF.priceIDR);
    setCifDesc(defaults.CIF.description || '');

    setActiveFormTab('pricing');
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setName(product.name);
    setCategory(product.category);
    setPriceIDR(product.priceIDR);
    setUnit(product.unit);
    setStock(product.stock);
    setOrigin(product.origin);
    setDescription(product.description);
    setImageUrls([...product.images]);
    setSpecs([...product.specs]);
    setEcoretaxType(product.ecoretaxType);

    // Existing pattern pricing or calculate defaults
    const patternPrices = product.patternPrices;
    const defaults = calculateDefaultPatternPrices(product.priceIDR, exchangeRate, product.category);

    setLocoPriceIDR(patternPrices?.Loco?.priceIDR || defaults.Loco.priceIDR);
    setLocoDesc(patternPrices?.Loco?.description || defaults.Loco.description || '');
    
    setFobPriceIDR(patternPrices?.FOB?.priceIDR || defaults.FOB.priceIDR);
    setFobDesc(patternPrices?.FOB?.description || defaults.FOB.description || '');
    
    setFrancoPriceIDR(patternPrices?.Franco?.priceIDR || defaults.Franco.priceIDR);
    setFrancoDesc(patternPrices?.Franco?.description || defaults.Franco.description || '');
    
    setCifPriceIDR(patternPrices?.CIF?.priceIDR || defaults.CIF.priceIDR);
    setCifDesc(patternPrices?.CIF?.description || defaults.CIF.description || '');

    setActiveFormTab('pricing');
    setIsModalOpen(true);
  };

  // Auto-calculate pattern prices based on base price
  const handleAutoCalculatePatterns = () => {
    const calculated = calculateDefaultPatternPrices(priceIDR, exchangeRate, category);
    setLocoPriceIDR(calculated.Loco.priceIDR);
    setLocoDesc(calculated.Loco.description || '');
    setFobPriceIDR(calculated.FOB.priceIDR);
    setFobDesc(calculated.FOB.description || '');
    setFrancoPriceIDR(calculated.Franco.priceIDR);
    setFrancoDesc(calculated.Franco.description || '');
    setCifPriceIDR(calculated.CIF.priceIDR);
    setCifDesc(calculated.CIF.description || '');
  };

  const handleAddImage = () => {
    if (!currentImageInput.trim()) return;
    setImageUrls([...imageUrls, currentImageInput.trim()]);
    setCurrentImageInput('');
  };

  const handleRemoveImage = (idx: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== idx));
  };

  const handleAddSpec = () => {
    if (!currentSpecInput.trim()) return;
    setSpecs([...specs, currentSpecInput.trim()]);
    setCurrentSpecInput('');
  };

  const handleRemoveSpec = (idx: number) => {
    setSpecs(specs.filter((_, i) => i !== idx));
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || priceIDR <= 0) return;

    const patternPrices: Record<PurchasePattern, PatternPricing> = {
      Loco: {
        priceIDR: locoPriceIDR,
        priceUSD: +(locoPriceIDR / exchangeRate).toFixed(2),
        description: locoDesc,
        enabled: true
      },
      FOB: {
        priceIDR: fobPriceIDR,
        priceUSD: +(fobPriceIDR / exchangeRate).toFixed(2),
        description: fobDesc,
        enabled: true
      },
      Franco: {
        priceIDR: francoPriceIDR,
        priceUSD: +(francoPriceIDR / exchangeRate).toFixed(2),
        description: francoDesc,
        enabled: true
      },
      CIF: {
        priceIDR: cifPriceIDR,
        priceUSD: +(cifPriceIDR / exchangeRate).toFixed(2),
        description: cifDesc,
        enabled: true
      }
    };

    const newProduct: Product = {
      id: editingProduct ? editingProduct.id : `prod-${Date.now()}`,
      name,
      category,
      priceIDR: fobPriceIDR > 0 ? fobPriceIDR : priceIDR,
      priceUSD: Math.round((fobPriceIDR > 0 ? fobPriceIDR : priceIDR) / (exchangeRate || 16350)),
      patternPrices,
      unit,
      stock,
      origin,
      description,
      images: imageUrls.length > 0 ? imageUrls : ['https://images.unsplash.com/photo-1541888946425-d0fbb186156a?auto=format&fit=crop&w=800&q=80'],
      specs,
      ecoretaxType,
      createdAt: editingProduct ? editingProduct.createdAt : new Date().toISOString()
    };

    StorageService.saveProduct(newProduct).then(() => {
      onDataUpdated();
    });
    setIsModalOpen(false);
    onDataUpdated();
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus produk ini dari katalog?')) {
      await StorageService.deleteProduct(id);
      onDataUpdated();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-900 font-bold text-[10px] uppercase tracking-wider">
              PRICING & KATALOG
            </span>
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-900 px-3 py-1 rounded-xl text-xs font-mono font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
              <span>LIVE KURS USD: 1$ = Rp {exchangeRate.toLocaleString('id-ID')}</span>
              <button
                onClick={handleSyncRate}
                disabled={isRefreshingRate}
                className="p-1 hover:bg-emerald-200/60 rounded-lg transition-colors cursor-pointer text-emerald-800"
                title="Update & Sinkronkan Kurs Real-Time dari Google Market Rate"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingRate ? 'animate-spin' : ''}`} />
              </button>
              <a
                href={GOOGLE_USD_IDR_SEARCH_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[11px] font-sans text-blue-900 hover:text-blue-700 underline font-bold ml-1 pl-2 border-l border-emerald-300"
                title="Buka Link Google Search Update Kurs USD Hari Ini"
              >
                <span>Google Rate</span>
                <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
            </div>
          </div>
          <h3 className="text-xl font-black text-slate-900 mt-2">
            Kelola Daftar Harga Produk & Sistem Pembelian (LOCO, FOB, FRANCO, CIF)
          </h3>
          <p className="text-xs text-slate-600 mt-1 max-w-3xl">
            Tentukan secara akurat harga per unit untuk masing-masing pola serah terima barang konsumen: 
            <strong> LOCO</strong> (Gudang/Tambang), <strong>FOB</strong> (Tongkang/Armada Asal), 
            <strong> FRANCO</strong> (Lokasi Proyek), dan <strong>CIF</strong> (Asuransi & Freight Laut).
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-5 py-3 bg-gradient-to-r from-blue-900 to-indigo-900 hover:from-blue-800 hover:to-indigo-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md cursor-pointer shrink-0 transition-all transform hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" /> Tambah Produk Baru
        </button>
      </div>

      {/* Explanation Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {(['Loco', 'FOB', 'Franco', 'CIF'] as PurchasePattern[]).map((pattern) => {
          const info = PURCHASE_PATTERNS_INFO[pattern];
          return (
            <div key={pattern} className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${info.badgeColor}`}>
                  {info.shortLabel}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">Incoterm</span>
              </div>
              <p className="text-xs font-bold text-slate-900">{info.deliveryPoint}</p>
              <p className="text-[11px] text-slate-500 leading-tight line-clamp-2">
                {info.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Product List Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => {
          const locoPricing = getProductPatternPrice(product, 'Loco', exchangeRate);
          const fobPricing = getProductPatternPrice(product, 'FOB', exchangeRate);
          const francoPricing = getProductPatternPrice(product, 'Franco', exchangeRate);
          const cifPricing = getProductPatternPrice(product, 'CIF', exchangeRate);

          return (
            <div
              key={product.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Image Header */}
                <div className="relative aspect-[16/10] bg-slate-950">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 bg-slate-950/80 text-white text-[10px] font-bold rounded">
                    {product.category}
                  </div>
                  <div className="absolute top-2 right-2 px-2 py-0.5 bg-blue-900 text-white text-[10px] font-bold rounded">
                    ECoretax: {product.ecoretaxType}
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 line-clamp-2">{product.name}</h4>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{product.origin}</span>
                      <span className="mx-1">•</span>
                      <span>Stok: <strong>{product.stock.toLocaleString('id-ID')} {product.unit}</strong></span>
                    </div>
                  </div>

                  {/* 4-Tier Pattern Pricing Matrix */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Daftar Harga Pola Pembelian:
                    </span>
                    
                    <div className="grid grid-cols-2 gap-2">
                      {/* LOCO */}
                      <div className="p-2 rounded-lg bg-emerald-50/70 border border-emerald-200/80 text-[11px]">
                        <div className="flex justify-between items-center text-[10px] font-black text-emerald-800">
                          <span>LOCO</span>
                          <span className="font-mono text-emerald-700">${locoPricing.priceUSD}</span>
                        </div>
                        <div className="font-extrabold text-emerald-950 font-mono mt-0.5">
                          {formatIDR(locoPricing.priceIDR)}
                        </div>
                        <span className="text-[9px] text-emerald-700/80 block leading-tight">Gudang/Stockpile</span>
                      </div>

                      {/* FOB */}
                      <div className="p-2 rounded-lg bg-blue-50/70 border border-blue-200/80 text-[11px]">
                        <div className="flex justify-between items-center text-[10px] font-black text-blue-800">
                          <span>FOB</span>
                          <span className="font-mono text-blue-700">${fobPricing.priceUSD}</span>
                        </div>
                        <div className="font-extrabold text-blue-950 font-mono mt-0.5">
                          {formatIDR(fobPricing.priceIDR)}
                        </div>
                        <span className="text-[9px] text-blue-700/80 block leading-tight">Tongkang/Pelabuhan</span>
                      </div>

                      {/* FRANCO */}
                      <div className="p-2 rounded-lg bg-purple-50/70 border border-purple-200/80 text-[11px]">
                        <div className="flex justify-between items-center text-[10px] font-black text-purple-800">
                          <span>FRANCO</span>
                          <span className="font-mono text-purple-700">${francoPricing.priceUSD}</span>
                        </div>
                        <div className="font-extrabold text-purple-950 font-mono mt-0.5">
                          {formatIDR(francoPricing.priceIDR)}
                        </div>
                        <span className="text-[9px] text-purple-700/80 block leading-tight">Titik Proyek Pembeli</span>
                      </div>

                      {/* CIF */}
                      <div className="p-2 rounded-lg bg-amber-50/70 border border-amber-200/80 text-[11px]">
                        <div className="flex justify-between items-center text-[10px] font-black text-amber-800">
                          <span>CIF</span>
                          <span className="font-mono text-amber-700">${cifPricing.priceUSD}</span>
                        </div>
                        <div className="font-extrabold text-amber-950 font-mono mt-0.5">
                          {formatIDR(cifPricing.priceIDR)}
                        </div>
                        <span className="text-[9px] text-amber-800/80 block leading-tight">Asuransi + Pelabuhan Tj</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => openEditModal(product)}
                  className="flex-1 py-2 px-3 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Kelola Harga & Detail
                </button>
                <button
                  onClick={() => handleDeleteProduct(product.id)}
                  className="p-2 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-xl cursor-pointer"
                  title="Hapus Produk"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-5xl lg:max-w-6xl w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-200 my-auto max-h-[95vh] flex flex-col overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h4 className="font-black text-lg text-slate-900 flex items-center gap-2">
                  <Package className="w-5 h-5 text-blue-900" />
                  {editingProduct ? `Edit Produk: ${name || editingProduct.name}` : 'Tambah Produk & Atur Harga Pola Pembelian'}
                </h4>
                <p className="text-xs text-slate-500">
                  Konfigurasikan harga per unit untuk sistem pembelian LOCO, FOB, FRANCO, dan CIF
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex gap-2 border-b border-slate-200 pb-2">
              <button
                type="button"
                onClick={() => setActiveFormTab('pricing')}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
                  activeFormTab === 'pricing'
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <DollarSign className="w-4 h-4" />
                <span>1. Harga LOCO / FOB / FRANCO / CIF</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveFormTab('general')}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
                  activeFormTab === 'general'
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Package className="w-4 h-4" />
                <span>2. Informasi Umum & Pajak</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveFormTab('media_specs')}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
                  activeFormTab === 'media_specs'
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                <span>3. Galeri Foto & Spesifikasi</span>
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-5 text-xs">
              {/* TAB 1: PRICING BY PATTERN (LOCO, FOB, FRANCO, CIF) */}
              {activeFormTab === 'pricing' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-blue-50/70 border border-blue-200 rounded-2xl">
                    <div className="flex items-start gap-2.5">
                      <Calculator className="w-5 h-5 text-blue-900 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-bold text-slate-900 text-xs">
                          Otomasi Rasio Harga Industri (Berdasarkan Kurs $1 = Rp{exchangeRate.toLocaleString('id-ID')})
                        </p>
                        <p className="text-[11px] text-slate-600">
                          Klik tombol untuk menghitung estimasi standar LOCO (-10%), FOB (Base), FRANCO (+12%), dan CIF (+25%). Anda tetap dapat mengedit nominalnya secara manual.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleAutoCalculatePatterns}
                      className="px-3.5 py-2 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Terapkan Estimasi Otomatis
                    </button>
                  </div>

                  {/* 4 Pattern Input Blocks */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* 1. LOCO */}
                    <div className="p-4 bg-emerald-50/50 rounded-2xl border-2 border-emerald-200 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-emerald-700 text-white font-black text-[10px]">
                            1. LOCO
                          </span>
                          <span className="font-bold text-slate-900 text-xs">Pengambilan di Gudang/Tambang</span>
                        </div>
                        <span className="text-[11px] font-bold text-emerald-800 font-mono">
                          ${(locoPriceIDR / exchangeRate).toFixed(2)}
                        </span>
                      </div>
                      
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Harga Satuan LOCO (IDR / {unit}) *
                        </label>
                        <input
                          type="number"
                          required
                          min={1}
                          value={locoPriceIDR}
                          onChange={(e) => setLocoPriceIDR(+e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-emerald-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none font-mono font-bold text-sm bg-white"
                        />
                        <div className="text-[10px] text-emerald-700 font-medium mt-1">
                          {formatIDR(locoPriceIDR)} / {unit}
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600 mb-1">
                          Keterangan / Titik Serah Terima LOCO
                        </label>
                        <input
                          type="text"
                          value={locoDesc}
                          onChange={(e) => setLocoDesc(e.target.value)}
                          placeholder="e.g. Ambil di Stockpile Tambang Muaro Jambi"
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                        />
                      </div>
                    </div>

                    {/* 2. FOB */}
                    <div className="p-4 bg-blue-50/50 rounded-2xl border-2 border-blue-200 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-blue-800 text-white font-black text-[10px]">
                            2. FOB
                          </span>
                          <span className="font-bold text-slate-900 text-xs">Free On Board (Dermaga Muat)</span>
                        </div>
                        <span className="text-[11px] font-bold text-blue-800 font-mono">
                          ${(fobPriceIDR / exchangeRate).toFixed(2)}
                        </span>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Harga Satuan FOB (IDR / {unit}) *
                        </label>
                        <input
                          type="number"
                          required
                          min={1}
                          value={fobPriceIDR}
                          onChange={(e) => {
                            setFobPriceIDR(+e.target.value);
                            setPriceIDR(+e.target.value);
                          }}
                          className="w-full px-3 py-2 rounded-xl border border-blue-300 focus:ring-2 focus:ring-blue-600 focus:outline-none font-mono font-bold text-sm bg-white"
                        />
                        <div className="text-[10px] text-blue-700 font-medium mt-1">
                          {formatIDR(fobPriceIDR)} / {unit}
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600 mb-1">
                          Keterangan / Armada FOB
                        </label>
                        <input
                          type="text"
                          value={fobDesc}
                          onChange={(e) => setFobDesc(e.target.value)}
                          placeholder="e.g. FOB Tongkang 300ft di Pelabuhan Batanghari"
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                        />
                      </div>
                    </div>

                    {/* 3. FRANCO */}
                    <div className="p-4 bg-purple-50/50 rounded-2xl border-2 border-purple-200 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-purple-800 text-white font-black text-[10px]">
                            3. FRANCO
                          </span>
                          <span className="font-bold text-slate-900 text-xs">Diantar ke Titik Proyek</span>
                        </div>
                        <span className="text-[11px] font-bold text-purple-800 font-mono">
                          ${(francoPriceIDR / exchangeRate).toFixed(2)}
                        </span>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Harga Satuan FRANCO (IDR / {unit}) *
                        </label>
                        <input
                          type="number"
                          required
                          min={1}
                          value={francoPriceIDR}
                          onChange={(e) => setFrancoPriceIDR(+e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-purple-300 focus:ring-2 focus:ring-purple-600 focus:outline-none font-mono font-bold text-sm bg-white"
                        />
                        <div className="text-[10px] text-purple-700 font-medium mt-1">
                          {formatIDR(francoPriceIDR)} / {unit}
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600 mb-1">
                          Keterangan / Cakupan Pengantaran FRANCO
                        </label>
                        <input
                          type="text"
                          value={francoDesc}
                          onChange={(e) => setFrancoDesc(e.target.value)}
                          placeholder="e.g. Franco sampai di stockpile/gudang proyek jalur darat"
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                        />
                      </div>
                    </div>

                    {/* 4. CIF */}
                    <div className="p-4 bg-amber-50/50 rounded-2xl border-2 border-amber-200 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-amber-800 text-white font-black text-[10px]">
                            4. CIF
                          </span>
                          <span className="font-bold text-slate-900 text-xs">Cost, Insurance & Freight</span>
                        </div>
                        <span className="text-[11px] font-bold text-amber-900 font-mono">
                          ${(cifPriceIDR / exchangeRate).toFixed(2)}
                        </span>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Harga Satuan CIF (IDR / {unit}) *
                        </label>
                        <input
                          type="number"
                          required
                          min={1}
                          value={cifPriceIDR}
                          onChange={(e) => setCifPriceIDR(+e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-amber-300 focus:ring-2 focus:ring-amber-600 focus:outline-none font-mono font-bold text-sm bg-white"
                        />
                        <div className="text-[10px] text-amber-800 font-medium mt-1">
                          {formatIDR(cifPriceIDR)} / {unit}
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600 mb-1">
                          Keterangan Pelabuhan & Asuransi CIF
                        </label>
                        <input
                          type="text"
                          value={cifDesc}
                          onChange={(e) => setCifDesc(e.target.value)}
                          placeholder="e.g. CIF Pelabuhan Merak/Cigading termasuk premi asuransi maritim"
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: GENERAL & TAX INFO */}
              {activeFormTab === 'general' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Nama Produk / Komoditas *</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Contoh: Batubara Curah GAR 4200 (FOB Tongkang)"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Kategori Sektor</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as ProductCategory)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      >
                        <option value="Perdagangan Komoditas & Mineral">Perdagangan Komoditas & Mineral</option>
                        <option value="Konstruksi Sipil & Material">Konstruksi Sipil & Material</option>
                        <option value="Pengadaan Alat & Logistik">Pengadaan Alat & Logistik</option>
                        <option value="Jasa Kontraktor & Engineering">Jasa Kontraktor & Engineering</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Satuan Unit (Ton, Kg, M3, Paket, Jam)</label>
                      <input
                        type="text"
                        required
                        value={unit}
                        onChange={(e) => setUnit(e.target.value)}
                        placeholder="Ton / Kg / M3 / Batang"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Jumlah Kuantitas Stok</label>
                      <input
                        type="number"
                        min={0}
                        value={stock}
                        onChange={(e) => setStock(+e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Asal / Lokasi Sumber Produk</label>
                      <input
                        type="text"
                        value={origin}
                        onChange={(e) => setOrigin(e.target.value)}
                        placeholder="Muaro Jambi / Cilegon / Gresik"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Status Perpajakan ECoretax</label>
                      <select
                        value={ecoretaxType}
                        onChange={(e) => setEcoretaxType(e.target.value as 'Include' | 'Exclude')}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      >
                        <option value="Include">Include PPN 11% & PPh (Terdaftar Faktur DJP)</option>
                        <option value="Exclude">Exclude (Ditambahkan pada Faktur Tagihan)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Deskripsi Lengkap Produk</label>
                    <textarea
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: MEDIA & SPECS */}
              {activeFormTab === 'media_specs' && (
                <div className="space-y-4">
                  {/* Gallery Image URLs Management */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700">Galeri Foto Slide Produk</label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        placeholder="Masukkan URL foto produk (JPG/PNG)..."
                        value={currentImageInput}
                        onChange={(e) => setCurrentImageInput(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs"
                      />
                      <button
                        type="button"
                        onClick={handleAddImage}
                        className="px-4 py-2 bg-slate-800 text-white font-bold rounded-xl cursor-pointer"
                      >
                        Tambah Foto
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {imageUrls.map((img, idx) => (
                        <div key={idx} className="relative group w-20 h-20 rounded-xl overflow-hidden border border-slate-200 shadow-xs">
                          <img src={img} alt="Product" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="absolute inset-0 bg-rose-900/80 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Specifications List */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700">Keterangan Spesifikasi Teknis (Berpoin)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Contoh: Diameter 12mm Full SNI..."
                        value={currentSpecInput}
                        onChange={(e) => setCurrentSpecInput(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs"
                      />
                      <button
                        type="button"
                        onClick={handleAddSpec}
                        className="px-4 py-2 bg-blue-900 text-white font-bold rounded-xl cursor-pointer"
                      >
                        Tambah Poin
                      </button>
                    </div>
                    <div className="space-y-1.5 pt-1">
                      {specs.map((spec, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                          <span>• {spec}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSpec(idx)}
                            className="text-rose-500 hover:text-rose-700 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
                <div className="text-[11px] text-slate-500">
                  * Harga yang disimpan akan langsung sinkron dengan kalkulasi pesanan konsumen di marketplace.
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-gradient-to-r from-blue-900 to-indigo-900 hover:from-blue-800 hover:to-indigo-800 text-white font-bold rounded-xl shadow-md cursor-pointer flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" /> Simpan & Perbarui Harga
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
