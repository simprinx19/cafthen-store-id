import { Product, PurchasePattern, PatternPricing } from '../types';

export interface PatternInfo {
  id: PurchasePattern;
  name: string;
  shortLabel: string;
  fullName: string;
  description: string;
  deliveryPoint: string;
  freightResponsibility: string;
  insuranceResponsibility: string;
  loadingResponsibility: string;
  bestFor: string;
  badgeColor: string;
  textColor: string;
  bgColor: string;
}

export const PURCHASE_PATTERNS_INFO: Record<PurchasePattern, PatternInfo> = {
  Loco: {
    id: 'Loco',
    name: 'LOCO (Loco Gudang/Tambang)',
    shortLabel: 'LOCO',
    fullName: 'Loco (Pengambilan Mandiri di Lokasi Asal)',
    description: 'Harga murni barang di titik gudang, pabrik, atau stockpile tambang penjual. Seluruh biaya pemuatan, armada angkut, asuransi, dan risiko pengiriman ditanggung oleh pembeli.',
    deliveryPoint: 'Gudang / Stockpile Tambang / Pabrik Penjual',
    freightResponsibility: 'Ditanggung Pembeli Sepenuhnya',
    insuranceResponsibility: 'Ditanggung Pembeli',
    loadingResponsibility: 'Pembeli / Koordinasi Lapangan',
    bestFor: 'Konsumen dengan armada truk/alat sendiri yang ingin biaya material terendah',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    textColor: 'text-emerald-700',
    bgColor: 'bg-emerald-50/60'
  },
  FOB: {
    id: 'FOB',
    name: 'FOB (Free On Board)',
    shortLabel: 'FOB',
    fullName: 'Free On Board (Di Atas Armada Angkut Asal)',
    description: 'Harga sudah mencakup barang + biaya pemuatan (loading) hingga barang berada di atas armada kapal tongkang/vessel atau truk di pelabuhan muat asal. Biaya perjalanan/freight pelayaran ditanggung pembeli.',
    deliveryPoint: 'Di Atas Kapal Tongkang / Dermaga Pelabuhan Asal',
    freightResponsibility: 'Ditanggung Pembeli dari Pelabuhan Asal',
    insuranceResponsibility: 'Ditanggung Pembeli',
    loadingResponsibility: 'Sudah Termasuk (Ditanggung Penjual)',
    bestFor: 'Perdagangan batubara kargo besar, mineral, dan pengiriman antar pulau via Tongkang',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
    textColor: 'text-blue-700',
    bgColor: 'bg-blue-50/60'
  },
  Franco: {
    id: 'Franco',
    name: 'FRANCO (Sampai di Lokasi Proyek)',
    shortLabel: 'FRANCO',
    fullName: 'Franco (Diantar Bersih Sampai Titik Proyek Pembeli)',
    description: 'Harga bersih dan praktis sampai di titik gudang atau lokasi proyek pembeli. Sudah termasuk ongkos angkut trucking, sopir, dan risiko perjalanan darat.',
    deliveryPoint: 'Gudang / Titik Koordinat Proyek Pembeli',
    freightResponsibility: 'Sudah Termasuk (Ditanggung Penjual)',
    insuranceResponsibility: 'Ditanggung Penjual selama Perjalanan Darat',
    loadingResponsibility: 'Sudah Termasuk',
    bestFor: 'Kontraktor proyek sipil, batching plant beton cor, dan pembeli besi/semen yang butuh kemudahan terima beres',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
    textColor: 'text-purple-700',
    bgColor: 'bg-purple-50/60'
  },
  CIF: {
    id: 'CIF',
    name: 'CIF (Cost, Insurance & Freight)',
    shortLabel: 'CIF',
    fullName: 'Cost, Insurance and Freight (Lengkap Asuransi & Pengapalan)',
    description: 'Harga all-in komprehensif mencakup harga barang, premi asuransi pengangkutan resmi (Marine Cargo Insurance), dan seluruh ongkos freight perairan/laut hingga sandar di pelabuhan tujuan pembeli.',
    deliveryPoint: 'Dermaga / Pelabuhan Tujuan Pembeli',
    freightResponsibility: 'Sudah Termasuk (Ditanggung Penjual hingga Pelabuhan Tujuan)',
    insuranceResponsibility: 'Sudah Termasuk (Polis Asuransi Maritim Resmi)',
    loadingResponsibility: 'Sudah Termasuk',
    bestFor: 'Pengiriman lintas pulau/ekspor komoditas dan industri berskala besar dengan garansi keamanan kargo penuh',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    textColor: 'text-amber-700',
    bgColor: 'bg-amber-50/60'
  }
};

/**
 * Get the exact price in IDR and USD for a specific purchase pattern
 */
export function getProductPatternPrice(
  product: Product,
  pattern: PurchasePattern,
  exchangeRate: number = 16350
): { priceIDR: number; priceUSD: number; description?: string; isCustom: boolean } {
  const patternConfig = product.patternPrices?.[pattern];

  if (patternConfig && patternConfig.priceIDR > 0) {
    const priceIDR = patternConfig.priceIDR;
    const priceUSD = patternConfig.priceUSD && patternConfig.priceUSD > 0
      ? patternConfig.priceUSD
      : +(priceIDR / exchangeRate).toFixed(2);

    return {
      priceIDR,
      priceUSD,
      description: patternConfig.description,
      isCustom: true
    };
  }

  // Realistic fallback ratio if specific pattern pricing not yet entered by admin
  let factor = 1.0;
  if (pattern === 'Loco') factor = 0.90; // Ambil mandiri di stockpile (~ -10%)
  else if (pattern === 'FOB') factor = 1.00; // Harga dasar FOB
  else if (pattern === 'Franco') factor = 1.12; // Ditambah ongkos trucking (+12%)
  else if (pattern === 'CIF') factor = 1.25; // Ditambah freight kapal + asuransi (+25%)

  const priceIDR = Math.round(product.priceIDR * factor);
  const priceUSD = +(priceIDR / exchangeRate).toFixed(2);

  return {
    priceIDR,
    priceUSD,
    description: PURCHASE_PATTERNS_INFO[pattern].description,
    isCustom: false
  };
}

/**
 * Helper to auto calculate recommended realistic price tiers for all 4 patterns
 */
export function calculateDefaultPatternPrices(
  basePriceIDR: number,
  exchangeRate: number = 16350,
  category?: string
): Record<PurchasePattern, PatternPricing> {
  // Commodities typically have lower Loco/FOB delta, heavy goods have higher Franco/CIF
  const isCommodity = category?.includes('Komoditas') || category?.includes('Mineral');

  const locoFactor = isCommodity ? 0.92 : 0.88;
  const fobFactor = 1.00;
  const francoFactor = isCommodity ? 1.15 : 1.10;
  const cifFactor = isCommodity ? 1.28 : 1.22;

  const locoIDR = Math.round(basePriceIDR * locoFactor);
  const fobIDR = Math.round(basePriceIDR * fobFactor);
  const francoIDR = Math.round(basePriceIDR * francoFactor);
  const cifIDR = Math.round(basePriceIDR * cifFactor);

  return {
    Loco: {
      priceIDR: locoIDR,
      priceUSD: +(locoIDR / exchangeRate).toFixed(2),
      description: 'Pengambilan mandiri di stockpile/gudang tambang',
      enabled: true
    },
    FOB: {
      priceIDR: fobIDR,
      priceUSD: +(fobIDR / exchangeRate).toFixed(2),
      description: 'FOB Tongkang di dermaga pelabuhan muat asal',
      enabled: true
    },
    Franco: {
      priceIDR: francoIDR,
      priceUSD: +(francoIDR / exchangeRate).toFixed(2),
      description: 'Franco diantar sampai titik lokasi proyek/gudang pembeli',
      enabled: true
    },
    CIF: {
      priceIDR: cifIDR,
      priceUSD: +(cifIDR / exchangeRate).toFixed(2),
      description: 'CIF Pelabuhan tujuan termasuk premi asuransi & freight kapal',
      enabled: true
    }
  };
}
