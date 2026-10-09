import { type Repository } from 'typeorm';
import type { CreateInvoiceDto } from './dto/create-invoice.dto.js';
import type { InvoiceDetailDto, InvoiceListResponseDto } from './dto/invoice-response.dto.js';
import type { ListInvoicesQueryDto } from './dto/list-invoices-query.dto.js';
import { Invoice } from './entities/invoice.entity.js';
export declare const DEFAULT_TAX_RATE = 10;
export declare class InvoicesService {
    private readonly invoices;
    constructor(invoices: Repository<Invoice>);
    findAll(query: ListInvoicesQueryDto): Promise<InvoiceListResponseDto>;
    findOne(invoiceId: string): Promise<InvoiceDetailDto>;
    create(dto: CreateInvoiceDto, userId: string): Promise<InvoiceDetailDto>;
    private applyFilters;
}
