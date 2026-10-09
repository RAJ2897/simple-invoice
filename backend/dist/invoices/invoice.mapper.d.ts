import type { Invoice } from './entities/invoice.entity.js';
import type { InvoiceDetailDto, InvoiceSummaryDto } from './dto/invoice-response.dto.js';
export declare function toInvoiceSummary(invoice: Invoice, today: string): InvoiceSummaryDto;
export declare function toInvoiceDetail(invoice: Invoice, today: string): InvoiceDetailDto;
