export function formatNaira(amount: number): string {
  if (amount == null || isNaN(amount)) return '₦0';
  if (amount >= 1_000_000_000) return `₦${+(amount / 1_000_000_000).toFixed(1)}B`;
  if (amount >= 1_000_000) return `₦${+(amount / 1_000_000).toFixed(2)}M`;
  return `₦${Math.round(amount).toLocaleString('en-NG')}`;
}

export function formatNairaFull(amount: number): string {
  if (amount == null || isNaN(amount)) return '₦0';
  return `₦${Math.round(amount).toLocaleString('en-NG')}`;
}

export function formatMileage(km: number | null | undefined): string {
  if (km == null) return 'N/A';
  return `${km.toLocaleString('en-NG')} km`;
}
