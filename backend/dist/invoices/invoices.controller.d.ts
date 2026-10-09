import { type AuthUser } from '../auth/current-user.decorator.js';
import { CreateInvoiceDto } from './dto/create-invoice.dto.js';
import { InvoiceDetailDto, InvoiceListResponseDto } from './dto/invoice-response.dto.js';
import { ListInvoicesQueryDto } from './dto/list-invoices-query.dto.js';
import { InvoicesService } from './invoices.service.js';
export declare class InvoicesController {
    private readonly invoicesService;
    constructor(invoicesService: InvoicesService);
    findAll(query: ListInvoicesQueryDto): Promise<InvoiceListResponseDto>;
    findOne(id: string): Promise<InvoiceDetailDto>;
    create(dto: CreateInvoiceDto, user: AuthUser): Promise<InvoiceDetailDto>;
}
