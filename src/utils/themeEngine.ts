import { ThemeSettings, ThemePreset } from '../types';
import { THEME_PRESET_CONFIGS, INITIAL_THEME_SETTINGS } from '../mockData';

export function applyThemeToDOM(theme: ThemeSettings) {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;

  // Primary & Hover
  root.style.setProperty('--theme-primary', theme.primaryColor || '#f59e0b');
  root.style.setProperty('--theme-primary-hover', theme.primaryHover || '#d97706');
  
  // Secondary / Dark Slate / Navy
  root.style.setProperty('--theme-secondary', theme.secondaryColor || '#0f172a');
  
  // Accent Highlight
  root.style.setProperty('--theme-accent', theme.accentColor || '#fbbf24');

  // Border Radius Mapping
  const radiusMap: Record<string, string> = {
    'rounded-xl': '0.75rem',
    'rounded-2xl': '1rem',
    'rounded-3xl': '1.5rem'
  };
  root.style.setProperty('--theme-radius', radiusMap[theme.borderRadius] || '1rem');

  // Root Data Attribute for theme variant
  root.setAttribute('data-theme-preset', theme.preset || 'gold-navy');
  root.setAttribute('data-dashboard-theme', theme.dashboardTheme || 'dark-executive');
}

export function getPresetConfig(preset: ThemePreset) {
  return THEME_PRESET_CONFIGS[preset] || THEME_PRESET_CONFIGS['gold-navy'];
}

export function createThemeFromPreset(preset: ThemePreset, currentSettings?: ThemeSettings): ThemeSettings {
  const presetConfig = getPresetConfig(preset);
  return {
    preset,
    themeName: presetConfig.name,
    primaryColor: presetConfig.primaryColor,
    primaryHover: presetConfig.primaryHover,
    secondaryColor: presetConfig.secondaryColor,
    accentColor: presetConfig.accentColor,
    dashboardTheme: currentSettings?.dashboardTheme || 'dark-executive',
    borderRadius: currentSettings?.borderRadius || 'rounded-2xl',
    fontFamily: currentSettings?.fontFamily || 'sans',
    enableGlowEffects: currentSettings?.enableGlowEffects ?? true,
    updatedAt: new Date().toISOString()
  };
}
