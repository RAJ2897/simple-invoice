/** Must stay in sync with backend/src/invoices/currencies.ts */
export const CURRENCIES: Array<{ code: string; symbol: string; label: string }> = [
  { code: 'AUD', symbol: 'AU$', label: 'Australian dollar' },
  { code: 'USD', symbol: 'US$', label: 'US dollar' },
  { code: 'GBP', symbol: '£', label: 'British pound' },
  { code: 'EUR', symbol: '€', label: 'Euro' },
  { code: 'SGD', symbol: 'S$', label: 'Singapore dollar' },
  { code: 'INR', symbol: '₹', label: 'Indian rupee' },
  { code: 'NZD', symbol: 'NZ$', label: 'New Zealand dollar' },
  { code: 'CAD', symbol: 'CA$', label: 'Canadian dollar' },
  { code: 'JPY', symbol: '¥', label: 'Japanese yen' },
]

export function currencySymbol(code: string): string {
  return CURRENCIES.find((c) => c.code === code)?.symbol ?? code
}
