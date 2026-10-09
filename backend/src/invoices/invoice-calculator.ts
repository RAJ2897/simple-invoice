import { Decimal } from 'decimal.js';

export interface InvoiceLine {
  quantity: number;
  rate: number;
}

export interface InvoiceAmountsInput {
  items: InvoiceLine[];
  /** Percentage, e.g. 10 for 10% */
  taxRate: number;
  /** Flat amount in the invoice currency */
  discount: number;
  totalPaid?: number;
}

export interface InvoiceAmounts {
  invoiceSubTotal: number;
  totalTax: number;
  totalDiscount: number;
  totalAmount: number;
  totalPaid: number;
  balanceAmount: number;
}

const toMoney = (value: Decimal) =>
  value.toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

/**
 * subTotal      = Σ quantity × rate
 * taxAmount     = subTotal × tax% / 100
 * totalAmount   = subTotal + taxAmount − discount
 * balanceAmount = totalAmount − totalPaid
 *
 * Uses decimal arithmetic so values like 0.1 + 0.2 don't drift.
 */
export function calculateInvoiceAmounts(
  input: InvoiceAmountsInput,
): InvoiceAmounts {
  const subTotal = toMoney(
    input.items.reduce(
      (sum, item) => sum.plus(new Decimal(item.quantity).times(item.rate)),
      new Decimal(0),
    ),
  );
  const tax = toMoney(subTotal.times(input.taxRate).dividedBy(100));
  const discount = toMoney(new Decimal(input.discount));
  const total = subTotal.plus(tax).minus(discount);
  const paid = toMoney(new Decimal(input.totalPaid ?? 0));

  return {
    invoiceSubTotal: subTotal.toNumber(),
    totalTax: tax.toNumber(),
    totalDiscount: discount.toNumber(),
    totalAmount: total.toNumber(),
    totalPaid: paid.toNumber(),
    balanceAmount: total.minus(paid).toNumber(),
  };
}
