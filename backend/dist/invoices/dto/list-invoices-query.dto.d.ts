import { InvoiceStatus } from '../invoice-status.js';
export declare const INVOICE_SORT_FIELDS: readonly ["invoiceDate", "dueDate", "totalAmount"];
export type InvoiceSortField = (typeof INVOICE_SORT_FIELDS)[number];
export declare class ListInvoicesQueryDto {
    page: number;
    pageSize: number;
    sortBy: InvoiceSortField;
    ordering: 'ASC' | 'DESC';
    status?: InvoiceStatus;
    keyword?: string;
    fromDate?: string;
    toDate?: string;
}
