export interface LogoPreset {
  id: string;
  name: string;
  description: string;
  svgDataUrl: string;
}

export const LOGO_PRESETS: LogoPreset[] = [
  {
    id: 'cip-gold-shield',
    name: 'Official CIP Gold Shield',
    description: 'Emblem Perisai Resmi CIP dengan Aksen Emas & Latar Belakang Biru Navy Royal',
    svgDataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200"><defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23091e42"/><stop offset="50%" stop-color="%231e3a8a"/><stop offset="100%" stop-color="%230f172a"/></linearGradient><linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23fde047"/><stop offset="50%" stop-color="%23f59e0b"/><stop offset="100%" stop-color="%23d97706"/></linearGradient></defs><rect width="200" height="200" rx="44" fill="url(%23bg)"/><rect x="8" y="8" width="184" height="184" rx="36" fill="none" stroke="url(%23gold)" stroke-width="3" opacity="0.9"/><path d="M100 28 L158 56 L158 112 C158 148 100 174 100 174 C100 174 42 148 42 112 L42 56 Z" fill="%230f172a" stroke="url(%23gold)" stroke-width="2.5" opacity="0.6"/><text x="100" y="112" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="44" fill="%23ffffff" text-anchor="middle" letter-spacing="2">CIP</text><text x="100" y="136" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="10" fill="%23fde047" text-anchor="middle" letter-spacing="3">CAFTHEN</text><circle cx="100" cy="56" r="4" fill="%23fbbf24"/></svg>`
  },
  {
    id: 'cip-modern-hex',
    name: 'Modern Hexagon Industrial',
    description: 'Gaya Geometris Hexagon Modern untuk Sektor Konstruksi & Komoditas',
    svgDataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200"><defs><linearGradient id="hexgrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%231e293b"/><stop offset="100%" stop-color="%230f172a"/></linearGradient><linearGradient id="ambergrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%2338bdf8"/><stop offset="100%" stop-color="%232563eb"/></linearGradient></defs><rect width="200" height="200" rx="44" fill="url(%23hexgrad)"/><polygon points="100,24 168,62 168,138 100,176 32,138 32,62" fill="none" stroke="url(%23ambergrad)" stroke-width="4"/><text x="100" y="114" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="46" fill="%23ffffff" text-anchor="middle">CIP</text><text x="100" y="138" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="9" fill="%2338bdf8" text-anchor="middle" letter-spacing="2">INDO PROJECT</text></svg>`
  },
  {
    id: 'cip-corporate-blue',
    name: 'Corporate Pure Blue & White',
    description: 'Desain Minimalis Elegan Berlatar Belakang Biru Bersih & Kontras Tinggi',
    svgDataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200"><defs><linearGradient id="blueg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%232563eb"/><stop offset="100%" stop-color="%231d4ed8"/></linearGradient></defs><rect width="200" height="200" rx="44" fill="url(%23blueg)"/><circle cx="100" cy="100" r="76" fill="none" stroke="%23ffffff" stroke-width="4" stroke-opacity="0.3"/><text x="100" y="112" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="48" fill="%23ffffff" text-anchor="middle" letter-spacing="1">CIP</text><text x="100" y="135" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="10" fill="%23fed7aa" text-anchor="middle" letter-spacing="2.5">STORE ID</text></svg>`
  },
  {
    id: 'cip-luxury-emerald',
    name: 'Emerald Green & Gold Prestige',
    description: 'Gaya Hijau Zamrud & Emas Melambangkan Kesejahteraan & Kredibilitas Usaha',
    svgDataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200"><defs><linearGradient id="emgrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23064e3b"/><stop offset="100%" stop-color="%23022c22"/></linearGradient><linearGradient id="gold2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23fef08a"/><stop offset="100%" stop-color="%23ca8a04"/></linearGradient></defs><rect width="200" height="200" rx="44" fill="url(%23emgrad)"/><circle cx="100" cy="100" r="80" fill="none" stroke="url(%23gold2)" stroke-width="3"/><text x="100" y="110" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="44" fill="%23ffffff" text-anchor="middle">CIP</text><text x="100" y="134" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="10" fill="%23fef08a" text-anchor="middle" letter-spacing="2">PT. CIP</text></svg>`
  }
];

export const DEFAULT_CIP_LOGO = LOGO_PRESETS[0].svgDataUrl;
