export function formatMoney(amount: number, currency = "USD") {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(amount);
  } catch {
    // fallback if unknown currency
    return `${amount.toFixed(2)} ${currency}`;
  }
}