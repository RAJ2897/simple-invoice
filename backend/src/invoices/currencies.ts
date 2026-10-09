/** Currencies offered in the UI, with the symbol stored alongside each invoice. */
export const CURRENCY_SYMBOLS: Record<string, string> = {
  AUD: 'AU$',
  USD: 'US$',
  GBP: '£',
  EUR: '€',
  SGD: 'S$',
  INR: '₹',
  NZD: 'NZ$',
  CAD: 'CA$',
  JPY: '¥',
};

export const SUPPORTED_CURRENCIES = Object.keys(CURRENCY_SYMBOLS);
