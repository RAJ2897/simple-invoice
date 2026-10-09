export interface InvoiceLine {
    quantity: number;
    rate: number;
}
export interface InvoiceAmountsInput {
    items: InvoiceLine[];
    taxRate: number;
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
export declare function calculateInvoiceAmounts(input: InvoiceAmountsInput): InvoiceAmounts;
