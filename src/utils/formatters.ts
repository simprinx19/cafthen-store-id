export function formatIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

export function formatPrice(amountIDR: number, currency: 'IDR' | 'USD', exchangeRate = 16250): string {
  if (currency === 'USD') {
    return formatUSD(amountIDR / exchangeRate);
  }
  return formatIDR(amountIDR);
}

export function getStatusBadgeClass(status: string): string {
  switch (status) {
    case 'Verified':
    case 'Kontrak Terbit':
    case 'DP Terverifikasi':
    case 'Selesai':
      return 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800';
    case 'Dalam Pengiriman':
    case 'Pemuatan Barang (Loading)':
      return 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800';
    case 'Tiba di Lokasi / Pelabuhan':
      return 'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800';
    case 'Pending':
    case 'Menunggu Verifikasi':
      return 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800';
    case 'Rejected':
    case 'Dibatalkan':
      return 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800';
    default:
      return 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
  }
}
