import { StorageService } from '../storage';

export const GOOGLE_USD_IDR_SEARCH_URL = "https://www.google.com/search?q=nilai+dollar+ke+rupiah+hari+ini&oq=nilai+dollar+ke+rupiah&gs_lcrp=EgZjaHJvbWUqBwgBEAAYgAQyBggAEEUYOTIHCAEQABiABDIHCAIQABiABDIHCAMQABiABDIHCAQQABiABDIGCAUQABgeMggIBhAAGAUYHjIICAcQABgFGB4yCAgIEAAYBRgeMgoICRAAGAUYChge0gEJMTQzOTBqMGo3qAIAsAIA&sourceid=chrome&source=chrome.ob&ie=UTF-8";

export const FALLBACK_GOOGLE_MARKET_RATE = 17685; // Latest August 2026 Google Market Rate (1 USD = Rp 17.685 IDR)

export const ExchangeRateService = {
  getGoogleSearchUrl(): string {
    return GOOGLE_USD_IDR_SEARCH_URL;
  },

  getCurrentRate(): number {
    const stored = StorageService.getExchangeRate();
    return stored && stored > 10000 ? stored : FALLBACK_GOOGLE_MARKET_RATE;
  },

  async fetchLiveRate(): Promise<number> {
    const apiEndpoints = [
      'https://open.er-api.com/v6/latest/USD',
      'https://api.exchangerate-api.com/v4/latest/USD',
      'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json'
    ];

    for (const endpoint of apiEndpoints) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

        const res = await fetch(endpoint, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          let idrRate = 0;
          if (data?.rates?.IDR) {
            idrRate = Math.round(data.rates.IDR);
          } else if (data?.usd?.idr) {
            idrRate = Math.round(data.usd.idr);
          }

          if (idrRate > 10000) {
            StorageService.setExchangeRate(idrRate);
            localStorage.setItem('cafthen_exchange_rate_updated_at', new Date().toISOString());
            window.dispatchEvent(new CustomEvent('cafthen_exchange_rate_updated', { detail: idrRate }));
            return idrRate;
          }
        }
      } catch (err) {
        console.warn(`Attempting next rate provider... (${endpoint})`, err);
      }
    }

    // Fallback if network is offline or blocked
    const currentStored = StorageService.getExchangeRate();
    const finalRate = currentStored && currentStored > 10000 ? currentStored : FALLBACK_GOOGLE_MARKET_RATE;
    StorageService.setExchangeRate(finalRate);
    return finalRate;
  }
};
