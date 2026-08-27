import React, { useState, useEffect } from 'react';
import { 
  Palette, 
  Sparkles, 
  Check, 
  RotateCcw, 
  Save, 
  Layout, 
  Sliders, 
  Eye, 
  Layers, 
  ShieldCheck, 
  Globe, 
  CheckCircle2,
  Brush,
  Sun,
  Moon,
  Compass
} from 'lucide-react';
import { ThemeSettings, ThemePreset } from '../../types';
import { THEME_PRESET_CONFIGS } from '../../mockData';
import { StorageService } from '../../storage';
import { createThemeFromPreset, applyThemeToDOM } from '../../utils/themeEngine';

interface AdminThemeSettingsProps {
  onDataUpdated: () => void;
}

export const AdminThemeSettings: React.FC<AdminThemeSettingsProps> = ({ onDataUpdated }) => {
  const [theme, setTheme] = useState<ThemeSettings>(StorageService.getThemeSettings());
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'presets' | 'custom' | 'preview'>('presets');

  // Keep DOM updated with active preview
  useEffect(() => {
    applyThemeToDOM(theme);
  }, [theme]);

  const handleSelectPreset = (presetKey: ThemePreset) => {
    const updated = createThemeFromPreset(presetKey, theme);
    setTheme(updated);
  };

  const handleCustomColorChange = (key: keyof ThemeSettings, value: any) => {
    setTheme(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveTheme = () => {
    StorageService.saveThemeSettings(theme);
    applyThemeToDOM(theme);
    setSaveSuccess(true);
    onDataUpdated();
    setTimeout(() => setSaveSuccess(false), 3500);
  };

  const handleResetToDefault = () => {
    const reset = StorageService.resetThemeSettings();
    setTheme(reset);
    applyThemeToDOM(reset);
    setSaveSuccess(true);
    onDataUpdated();
    setTimeout(() => setSaveSuccess(false), 3500);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. Header Banner */}
      <div 
        className="p-6 sm:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-all duration-300"
        style={{ backgroundColor: theme.secondaryColor || '#0f172a' }}
      >
        <div className="relative z-10 space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-inner" style={{ backgroundColor: `${theme.primaryColor}25`, color: theme.primaryColor }}>
            <Palette className="w-4 h-4" />
            <span>Kustomisasi Desain & Tema Warna</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Ubah Tema Halaman Depan & Dashboard
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Sesuaikan palet warna primer, warna aksen, gaya dashboard, dan nuansa visual website utama serta portal admin. Perubahan tersimpan di database Supabase (db_cip) dan otomatis diterapkan ke seluruh perangkat konsumen & staf.
          </p>
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
          <button
            onClick={handleResetToDefault}
            className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer border border-white/15"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Default</span>
          </button>

          <button
            onClick={handleSaveTheme}
            style={{ backgroundColor: theme.primaryColor, color: '#0f172a' }}
            className="px-6 py-2.5 rounded-2xl text-xs font-black flex items-center justify-center gap-2 shadow-lg hover:brightness-110 transition-all cursor-pointer"
          >
            {saveSuccess ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            <span>{saveSuccess ? 'Tema Tersimpan!' : 'Terapkan & Simpan Tema'}</span>
          </button>
        </div>

        {/* Decorative ambient glow */}
        <div 
          className="absolute -right-16 -bottom-16 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: theme.primaryColor }}
        />
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold flex items-center gap-3 shadow-sm animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Tema dan warna visual berhasil disimpan ke Supabase Database (db_cip)! Seluruh browser dan perangkat pengunjung akan otomatis memuat tema ini.</span>
        </div>
      )}

      {/* 2. Navigation Mode Tabs */}
      <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs max-w-md">
        <button
          onClick={() => setActiveTab('presets')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'presets' 
              ? 'bg-slate-900 text-white shadow' 
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Preset Industri</span>
        </button>
        <button
          onClick={() => setActiveTab('custom')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'custom' 
              ? 'bg-slate-900 text-white shadow' 
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Kustom Warna</span>
        </button>
        <button
          onClick={() => setActiveTab('preview')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'preview' 
              ? 'bg-slate-900 text-white shadow' 
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Live Preview</span>
        </button>
      </div>

      {/* TAB 1: PRESETS */}
      {activeTab === 'presets' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Compass className="w-4 h-4 text-blue-600" />
              <span>Pilihan Palet Tema Industri Curated (Klik untuk Menerapkan)</span>
            </h3>
            <span className="text-xs text-slate-500 font-medium">8 Preset Tersedia</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {(Object.entries(THEME_PRESET_CONFIGS) as [ThemePreset, any][]).map(([key, config]) => {
              const isSelected = theme.preset === key;
              return (
                <div
                  key={key}
                  onClick={() => handleSelectPreset(key)}
                  className={`p-5 rounded-3xl border-2 transition-all duration-200 cursor-pointer flex flex-col justify-between relative overflow-hidden bg-white shadow-sm hover:shadow-md ${
                    isSelected
                      ? 'border-blue-600 ring-4 ring-blue-500/15 scale-[1.02]'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shadow">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}

                  <div className="space-y-3">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700">
                      {config.badge}
                    </span>

                    {/* Color Swatch Dots */}
                    <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-2xl border border-slate-100">
                      <div 
                        className="w-7 h-7 rounded-xl shadow-xs border border-white shrink-0" 
                        style={{ backgroundColor: config.primaryColor }}
                        title={`Primary: ${config.primaryColor}`}
                      />
                      <div 
                        className="w-7 h-7 rounded-xl shadow-xs border border-white shrink-0" 
                        style={{ backgroundColor: config.secondaryColor }}
                        title={`Secondary: ${config.secondaryColor}`}
                      />
                      <div 
                        className="w-7 h-7 rounded-xl shadow-xs border border-white shrink-0" 
                        style={{ backgroundColor: config.accentColor }}
                        title={`Accent: ${config.accentColor}`}
                      />
                    </div>

                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 leading-tight">
                        {config.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {config.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold">
                    <span className={isSelected ? 'text-blue-600 font-extrabold' : 'text-slate-400'}>
                      {isSelected ? '● Aktif' : 'Pilih Tema'}
                    </span>
                    <span className="font-mono text-slate-400 text-[10px]">
                      {config.primaryColor}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: CUSTOM COLOR PICKERS */}
      {activeTab === 'custom' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Palet Warna Bebas */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Brush className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-sm text-slate-900">Penyesuaian Warna Hexadecimal</h3>
                <p className="text-xs text-slate-500">Sesuaikan warna tombol, highlight, dan latar header</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Primary Color */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-4">
                <div>
                  <label className="text-xs font-extrabold text-slate-900 block">Warna Primer (Primary Accent)</label>
                  <span className="text-[11px] text-slate-500">Tombol aksi, badge terpopuler, ikon penting</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <input
                    type="color"
                    value={theme.primaryColor}
                    onChange={(e) => handleCustomColorChange('primaryColor', e.target.value)}
                    className="w-10 h-10 rounded-xl cursor-pointer border-0 bg-transparent"
                  />
                  <input
                    type="text"
                    value={theme.primaryColor}
                    onChange={(e) => handleCustomColorChange('primaryColor', e.target.value)}
                    className="w-24 px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-800 uppercase"
                  />
                </div>
              </div>

              {/* Primary Hover Color */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-4">
                <div>
                  <label className="text-xs font-extrabold text-slate-900 block">Warna Hover Tombol Primer</label>
                  <span className="text-[11px] text-slate-500">Warna saat kursor mengarah ke tombol utama</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <input
                    type="color"
                    value={theme.primaryHover}
                    onChange={(e) => handleCustomColorChange('primaryHover', e.target.value)}
                    className="w-10 h-10 rounded-xl cursor-pointer border-0 bg-transparent"
                  />
                  <input
                    type="text"
                    value={theme.primaryHover}
                    onChange={(e) => handleCustomColorChange('primaryHover', e.target.value)}
                    className="w-24 px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-800 uppercase"
                  />
                </div>
              </div>

              {/* Secondary Color */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-4">
                <div>
                  <label className="text-xs font-extrabold text-slate-900 block">Warna Sekunder / Header Slate</label>
                  <span className="text-[11px] text-slate-500">Latar strip atas navbar, header dashboard, footer banner</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <input
                    type="color"
                    value={theme.secondaryColor}
                    onChange={(e) => handleCustomColorChange('secondaryColor', e.target.value)}
                    className="w-10 h-10 rounded-xl cursor-pointer border-0 bg-transparent"
                  />
                  <input
                    type="text"
                    value={theme.secondaryColor}
                    onChange={(e) => handleCustomColorChange('secondaryColor', e.target.value)}
                    className="w-24 px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-800 uppercase"
                  />
                </div>
              </div>

              {/* Accent Color */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-4">
                <div>
                  <label className="text-xs font-extrabold text-slate-900 block">Warna Sorotan (Accent Highlight)</label>
                  <span className="text-[11px] text-slate-500">Efek glow, badge status, highlight teks banner</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <input
                    type="color"
                    value={theme.accentColor}
                    onChange={(e) => handleCustomColorChange('accentColor', e.target.value)}
                    className="w-10 h-10 rounded-xl cursor-pointer border-0 bg-transparent"
                  />
                  <input
                    type="text"
                    value={theme.accentColor}
                    onChange={(e) => handleCustomColorChange('accentColor', e.target.value)}
                    className="w-24 px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-800 uppercase"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Opsi Tata Letak & Gaya Dashboard */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Layout className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-sm text-slate-900">Gaya Tampilan Dashboard & Sudut</h3>
                <p className="text-xs text-slate-500">Atur mood tampilan dashboard dan radius sudut antarmuka</p>
              </div>
            </div>

            <div className="space-y-5">
              {/* Dashboard Mood */}
              <div>
                <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider block mb-2">
                  Nuansa Warna Dashboard Admin
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'dark-executive', label: 'Eksekutif Gelap', icon: Moon, desc: 'Slate Hitam Premium' },
                    { id: 'navy-slate', label: 'Navy Korporat', icon: Compass, desc: 'Biru Tua Maritim' },
                    { id: 'light-modern', label: 'Modern Terang', icon: Sun, desc: 'Abu-abu Bersih' },
                  ].map((mode) => {
                    const isSelected = theme.dashboardTheme === mode.id;
                    const Icon = mode.icon;
                    return (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => handleCustomColorChange('dashboardTheme', mode.id)}
                        className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                        <div>
                          <div className="text-xs font-bold text-slate-900 leading-tight">{mode.label}</div>
                          <div className="text-[10px] text-slate-500">{mode.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Border Radius */}
              <div>
                <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider block mb-2">
                  Kelengkungan Sudut Komponen (Corner Radius)
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'rounded-xl', label: 'Standar (xl)', radius: 'rounded-xl' },
                    { id: 'rounded-2xl', label: 'Modern (2xl)', radius: 'rounded-2xl' },
                    { id: 'rounded-3xl', label: 'Lembut (3xl)', radius: 'rounded-3xl' },
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => handleCustomColorChange('borderRadius', r.id)}
                      className={`p-3 rounded-2xl border-2 text-center transition-all cursor-pointer font-bold text-xs ${
                        theme.borderRadius === r.id
                          ? 'border-blue-600 bg-blue-50/60 text-blue-900 ring-2 ring-blue-500/20'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                      }`}
                    >
                      <div className={`w-6 h-6 border-2 border-slate-400 mx-auto mb-1.5 ${r.radius} ${theme.borderRadius === r.id ? 'border-blue-600 bg-blue-100' : ''}`} />
                      <span>{r.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Glow Effect Toggle */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-xs font-extrabold text-slate-900">Efek Kilau & Ambient Glow</div>
                  <div className="text-[11px] text-slate-500">Aktifkan efek pencahayaan aksen di banner dan kartu</div>
                </div>
                <input
                  type="checkbox"
                  checked={theme.enableGlowEffects}
                  onChange={(e) => handleCustomColorChange('enableGlowEffects', e.target.checked)}
                  className="w-5 h-5 rounded-md accent-blue-600 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: LIVE PREVIEW MOCKUP */}
      {(activeTab === 'preview' || activeTab === 'presets' || activeTab === 'custom') && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Eye className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-sm text-slate-900">Simulasi Tampilan Langsung (Live Interactive Preview)</h3>
                <p className="text-xs text-slate-500">Pratinjau elemen antarmuka halaman publik & dashboard</p>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-extrabold" style={{ backgroundColor: `${theme.primaryColor}20`, color: theme.primaryColor }}>
              {theme.themeName || 'Kustom'}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
            {/* 1. Preview Halaman Publik */}
            <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200 space-y-4">
              <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider block">
                1. Preview Elemen Halaman Utama (Publik)
              </span>

              {/* Mini Hero Banner */}
              <div 
                className="p-5 rounded-2xl text-white relative overflow-hidden shadow"
                style={{ backgroundColor: theme.secondaryColor }}
              >
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black" style={{ backgroundColor: `${theme.primaryColor}30`, color: theme.primaryColor }}>
                  <Sparkles className="w-3 h-3" />
                  <span>PT. CAFTHEN INDO PROJECT</span>
                </div>
                <h4 className="text-base font-black mt-2 leading-tight">
                  Perdagangan Komoditas & <span style={{ color: theme.primaryColor }}>Konstruksi Terpercaya</span>
                </h4>
                <div className="mt-4 flex gap-2">
                  <button 
                    style={{ backgroundColor: theme.primaryColor, color: '#0f172a' }}
                    className="px-3 py-1.5 rounded-xl text-[11px] font-black shadow-sm"
                  >
                    Beli Komoditas
                  </button>
                  <button className="px-3 py-1.5 rounded-xl text-[11px] font-bold bg-white/10 text-white border border-white/20">
                    Lihat Profil
                  </button>
                </div>
              </div>

              {/* Mini Product Card */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <span className="text-[9px] font-black px-2 py-0.5 rounded-full" style={{ backgroundColor: `${theme.primaryColor}20`, color: theme.primaryColor }}>
                    ARANG BATOK KELAPA
                  </span>
                  <div className="font-extrabold text-xs text-slate-900">Grade Ekspor Premium 500 MT</div>
                  <div className="text-xs font-black" style={{ color: theme.primaryColor }}>
                    Rp 9.500 <span className="text-[10px] text-slate-400 font-normal">/ Kg (FOB)</span>
                  </div>
                </div>
                <button 
                  style={{ backgroundColor: theme.primaryColor, color: '#0f172a' }}
                  className="px-3.5 py-2 rounded-xl text-[11px] font-black shadow-xs shrink-0 cursor-pointer"
                >
                  Pesan Sekarang
                </button>
              </div>
            </div>

            {/* 2. Preview Dashboard Admin */}
            <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200 space-y-4">
              <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider block">
                2. Preview Elemen Dashboard Admin
              </span>

              {/* Mini Dashboard Header */}
              <div 
                className="p-4 rounded-2xl text-white flex items-center justify-between shadow"
                style={{ backgroundColor: theme.secondaryColor }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs" style={{ backgroundColor: theme.primaryColor, color: '#0f172a' }}>
                    CIP
                  </div>
                  <div>
                    <div className="text-xs font-bold">Dashboard Administrator</div>
                    <div className="text-[9px]" style={{ color: theme.accentColor }}>Akun: Super Admin</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-white/10 rounded-full text-[9px] text-emerald-300 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Aktif
                </span>
              </div>

              {/* Mini Metric Card */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
                  <div className="text-[10px] text-slate-500 font-semibold">Total Omset Penjualan</div>
                  <div className="text-sm font-black text-slate-900">Rp 12.850.000.000</div>
                  <div className="text-[10px] font-bold text-emerald-600">▲ +18.4% bulan ini</div>
                </div>

                <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
                  <div className="text-[10px] text-slate-500 font-semibold">Pesanan Terverifikasi</div>
                  <div className="text-sm font-black text-slate-900">42 Transaksi</div>
                  <div className="text-[10px] font-bold" style={{ color: theme.primaryColor }}>
                    ● 100% Sesuai Kontrak
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Action Footer */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Tema otomatis diterapkan secara instan ke seluruh halaman tanpa reload.</span>
            </div>

            <button
              onClick={handleSaveTheme}
              style={{ backgroundColor: theme.primaryColor, color: '#0f172a' }}
              className="w-full sm:w-auto px-6 py-2.5 rounded-2xl text-xs font-black flex items-center justify-center gap-2 shadow-md hover:brightness-110 transition-all cursor-pointer"
            >
              {saveSuccess ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              <span>{saveSuccess ? 'Tema Tersimpan di Supabase!' : 'Simpan & Terapkan Tema'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
