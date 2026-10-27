/** Formats a PKR amount as a compact currency string, e.g. 1840000 -> "₨1.84M". */
export function formatPkr(amount: number): string {
  if (Math.abs(amount) >= 1_000_000) return `₨${(amount / 1_000_000).toFixed(2)}M`;
  if (Math.abs(amount) >= 1_000) return `₨${(amount / 1_000).toFixed(1)}K`;
  return `₨${Math.round(amount).toLocaleString()}`;
}

/** Formats a PKR amount with full comma separators, e.g. 42750 -> "₨42,750". */
export function formatPkrFull(amount: number): string {
  return `₨${Math.round(amount).toLocaleString()}`;
}

export function formatKg(qty: number): string {
  return `${qty.toLocaleString()} kg`;
}

export function formatPct(value: number): string {
  return `${Math.round(value)}%`;
}
