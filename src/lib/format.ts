export function formatPrice(cents: number): string {
  const amount = new Intl.NumberFormat("fr-TN", {
    maximumFractionDigits: 0,
  }).format(cents / 100);
  return `${amount} DT`;
}

export function orderNumber(): string {
  const rand = Math.floor(1000 + Math.random() * 9000);
  const year = new Date().getFullYear();
  return `NM-${year}-${rand}`;
}
