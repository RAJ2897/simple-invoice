import { calculateInvoiceAmounts } from './invoice-calculator.js';

describe('calculateInvoiceAmounts', () => {
  it('matches the Appendix A sample invoice', () => {
    const result = calculateInvoiceAmounts({
      items: [{ quantity: 2, rate: 1000 }],
      taxRate: 10,
      discount: 20,
      totalPaid: 1451.34,
    });

    expect(result).toEqual({
      invoiceSubTotal: 2000,
      totalTax: 200,
      totalDiscount: 20,
      totalAmount: 2180,
      totalPaid: 1451.34,
      balanceAmount: 728.66,
    });
  });

  it('defaults totalPaid to zero so the balance equals the total', () => {
    const result = calculateInvoiceAmounts({
      items: [{ quantity: 1, rate: 99.5 }],
      taxRate: 10,
      discount: 0,
    });

    expect(result.totalPaid).toBe(0);
    expect(result.balanceAmount).toBe(result.totalAmount);
    expect(result.totalAmount).toBe(109.45);
  });

  it('avoids floating point drift on cents', () => {
    // 3 × 0.1 is 0.30000000000000004 with plain JS numbers
    const result = calculateInvoiceAmounts({
      items: [{ quantity: 3, rate: 0.1 }],
      taxRate: 0,
      discount: 0,
    });

    expect(result.invoiceSubTotal).toBe(0.3);
    expect(result.totalAmount).toBe(0.3);
  });

  it('rounds tax half-up to two decimals', () => {
    // 59.97 × 10% = 5.997 → 6.00 ; 19.99 × 7.5% = 1.49925 → 1.50
    expect(
      calculateInvoiceAmounts({
        items: [{ quantity: 3, rate: 19.99 }],
        taxRate: 10,
        discount: 0,
      }).totalTax,
    ).toBe(6);
    expect(
      calculateInvoiceAmounts({
        items: [{ quantity: 1, rate: 19.99 }],
        taxRate: 7.5,
        discount: 0,
      }).totalTax,
    ).toBe(1.5);
  });

  it('handles a zero tax rate', () => {
    const result = calculateInvoiceAmounts({
      items: [{ quantity: 4, rate: 25 }],
      taxRate: 0,
      discount: 10,
    });

    expect(result.totalTax).toBe(0);
    expect(result.totalAmount).toBe(90);
  });

  it('sums multiple line items (model supports more than one)', () => {
    const result = calculateInvoiceAmounts({
      items: [
        { quantity: 2, rate: 50 },
        { quantity: 1, rate: 25.25 },
      ],
      taxRate: 10,
      discount: 0,
    });

    expect(result.invoiceSubTotal).toBe(125.25);
    expect(result.totalTax).toBe(12.53);
    expect(result.totalAmount).toBe(137.78);
  });

  it('returns a negative total when the discount exceeds subtotal + tax (caller rejects it)', () => {
    const result = calculateInvoiceAmounts({
      items: [{ quantity: 1, rate: 10 }],
      taxRate: 10,
      discount: 50,
    });

    expect(result.totalAmount).toBe(-39);
  });
});
