import { User } from '../../users/user.entity.js';
import { PersistedInvoiceStatus } from '../invoice-status.js';
import { InvoiceItem } from './invoice-item.entity.js';
export declare class Invoice {
    invoiceId: string;
    invoiceNumber: string;
    invoiceReference: string | null;
    invoiceDate: string;
    dueDate: string;
    currency: string;
    currencySymbol: string;
    description: string | null;
    status: PersistedInvoiceStatus;
    customerFullname: string;
    customerEmail: string;
    customerMobile: string | null;
    customerAddress: string | null;
    taxRate: number;
    invoiceSubTotal: number;
    totalTax: number;
    totalDiscount: number;
    totalAmount: number;
    totalPaid: number;
    balanceAmount: number;
    createdAt: Date;
    createdBy: string;
    creator?: User;
    items: InvoiceItem[];
}
