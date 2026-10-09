import type { Invoice } from './invoice.entity.js';
export declare class InvoiceItem {
    id: string;
    invoiceId: string;
    name: string;
    quantity: number;
    rate: number;
    invoice?: Invoice;
}
