import { PersistedInvoiceStatus } from '../../invoices/invoice-status.js';
export interface SeedInvoice {
    invoiceId?: string;
    invoiceNumber: string;
    invoiceReference: string | null;
    invoiceDate: string;
    dueDate: string;
    currency: string;
    description: string | null;
    status: PersistedInvoiceStatus;
    customer: {
        fullname: string;
        email: string;
        mobileNumber: string | null;
        address: string | null;
    };
    item: {
        name: string;
        quantity: number;
        rate: number;
    };
    taxRate: number;
    discount: number;
    paidRatio: number;
    createdAt: Date;
}
export declare const SEED_USER_ID = "ad1e0902-1928-4345-b513-60c86c94fc91";
export declare const appendixInvoice: SeedInvoice;
export declare function generateInvoices(count: number, today: string): SeedInvoice[];
