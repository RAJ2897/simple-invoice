export declare class CustomerDto {
    fullname: string;
    email: string;
    mobileNumber?: string;
    address?: string;
}
export declare class InvoiceItemDto {
    name: string;
    quantity: number;
    rate: number;
}
export declare class CreateInvoiceDto {
    invoiceNumber: string;
    invoiceReference?: string;
    invoiceDate: string;
    dueDate: string;
    currency: string;
    description?: string;
    customer: CustomerDto;
    items: InvoiceItemDto[];
    taxRate?: number;
    discount?: number;
}
