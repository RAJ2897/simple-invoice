import { InvoiceStatus } from '../invoice-status.js';
export declare class CustomerResponseDto {
    fullname: string;
    email: string;
    mobileNumber: string | null;
    address: string | null;
}
export declare class InvoiceItemResponseDto {
    id: string;
    name: string;
    quantity: number;
    rate: number;
    amount: number;
}
export declare class InvoiceSummaryDto {
    invoiceId: string;
    invoiceNumber: string;
    invoiceReference: string | null;
    invoiceDate: string;
    dueDate: string;
    currency: string;
    currencySymbol: string;
    status: InvoiceStatus;
    customer: CustomerResponseDto;
    totalAmount: number;
    balanceAmount: number;
}
export declare class InvoiceDetailDto extends InvoiceSummaryDto {
    description: string | null;
    items: InvoiceItemResponseDto[];
    taxRate: number;
    invoiceSubTotal: number;
    totalTax: number;
    totalDiscount: number;
    totalPaid: number;
    createdAt: string;
    createdBy: string;
}
export declare class PagingDto {
    page: number;
    pageSize: number;
    total: number;
}
export declare class InvoiceListResponseDto {
    data: InvoiceSummaryDto[];
    paging: PagingDto;
}
