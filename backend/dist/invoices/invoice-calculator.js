import { Decimal } from 'decimal.js';
const toMoney = (value) => value.toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
export function calculateInvoiceAmounts(input) {
    const subTotal = toMoney(input.items.reduce((sum, item) => sum.plus(new Decimal(item.quantity).times(item.rate)), new Decimal(0)));
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
//# sourceMappingURL=invoice-calculator.js.map