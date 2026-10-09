var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { BadRequestException, ConflictException, Injectable, NotFoundException, } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, } from 'typeorm';
import { todayIsoDate } from '../common/utils/date.js';
import { CURRENCY_SYMBOLS } from './currencies.js';
import { Invoice } from './entities/invoice.entity.js';
import { calculateInvoiceAmounts } from './invoice-calculator.js';
import { InvoiceStatus, PersistedInvoiceStatus } from './invoice-status.js';
import { toInvoiceDetail, toInvoiceSummary } from './invoice.mapper.js';
export const DEFAULT_TAX_RATE = 10;
const SORT_COLUMNS = {
    invoiceDate: 'invoice.invoiceDate',
    dueDate: 'invoice.dueDate',
    totalAmount: 'invoice.totalAmount',
};
const UNIQUE_VIOLATION = '23505';
let InvoicesService = class InvoicesService {
    invoices;
    constructor(invoices) {
        this.invoices = invoices;
    }
    async findAll(query) {
        const today = todayIsoDate();
        const { page, pageSize, sortBy, ordering } = query;
        const qb = this.invoices.createQueryBuilder('invoice');
        this.applyFilters(qb, query, today);
        const [rows, total] = await qb
            .orderBy(SORT_COLUMNS[sortBy], ordering)
            .addOrderBy('invoice.invoiceNumber', 'ASC')
            .skip((page - 1) * pageSize)
            .take(pageSize)
            .getManyAndCount();
        return {
            data: rows.map((row) => toInvoiceSummary(row, today)),
            paging: { page, pageSize, total },
        };
    }
    async findOne(invoiceId) {
        const invoice = await this.invoices.findOne({
            where: { invoiceId },
            relations: { items: true },
        });
        if (!invoice) {
            throw new NotFoundException('Invoice not found');
        }
        return toInvoiceDetail(invoice, todayIsoDate());
    }
    async create(dto, userId) {
        const taxRate = dto.taxRate ?? DEFAULT_TAX_RATE;
        const amounts = calculateInvoiceAmounts({
            items: dto.items,
            taxRate,
            discount: dto.discount ?? 0,
        });
        if (amounts.totalAmount < 0) {
            throw new BadRequestException([
                'discount cannot be greater than the subtotal plus tax',
            ]);
        }
        const invoice = this.invoices.create({
            invoiceNumber: dto.invoiceNumber,
            invoiceReference: dto.invoiceReference ?? null,
            invoiceDate: dto.invoiceDate,
            dueDate: dto.dueDate,
            currency: dto.currency,
            currencySymbol: CURRENCY_SYMBOLS[dto.currency] ?? dto.currency,
            description: dto.description ?? null,
            status: PersistedInvoiceStatus.Draft,
            customerFullname: dto.customer.fullname,
            customerEmail: dto.customer.email,
            customerMobile: dto.customer.mobileNumber ?? null,
            customerAddress: dto.customer.address ?? null,
            taxRate,
            ...amounts,
            createdBy: userId,
            items: dto.items.map((item) => ({
                name: item.name,
                quantity: item.quantity,
                rate: item.rate,
            })),
        });
        try {
            const saved = await this.invoices.save(invoice);
            return this.findOne(saved.invoiceId);
        }
        catch (error) {
            if (isUniqueViolation(error)) {
                throw new ConflictException(`Invoice number "${dto.invoiceNumber}" already exists`);
            }
            throw error;
        }
    }
    applyFilters(qb, query, today) {
        if (query.keyword) {
            qb.andWhere('(invoice.invoiceNumber ILIKE :keyword OR invoice.customerFullname ILIKE :keyword)', { keyword: `%${escapeLike(query.keyword)}%` });
        }
        switch (query.status) {
            case InvoiceStatus.Overdue:
                qb.andWhere('invoice.status <> :paid AND invoice.dueDate < :today', {
                    paid: PersistedInvoiceStatus.Paid,
                    today,
                });
                break;
            case InvoiceStatus.Paid:
                qb.andWhere('invoice.status = :status', {
                    status: PersistedInvoiceStatus.Paid,
                });
                break;
            case InvoiceStatus.Draft:
            case InvoiceStatus.Pending:
                qb.andWhere('invoice.status = :status AND invoice.dueDate >= :today', {
                    status: query.status,
                    today,
                });
                break;
        }
        if (query.fromDate) {
            qb.andWhere('invoice.invoiceDate >= :fromDate', {
                fromDate: query.fromDate,
            });
        }
        if (query.toDate) {
            qb.andWhere('invoice.invoiceDate <= :toDate', { toDate: query.toDate });
        }
    }
};
InvoicesService = __decorate([
    Injectable(),
    __param(0, InjectRepository(Invoice)),
    __metadata("design:paramtypes", [Function])
], InvoicesService);
export { InvoicesService };
function escapeLike(value) {
    return value.replace(/[\\%_]/g, (char) => `\\${char}`);
}
function isUniqueViolation(error) {
    if (!(error instanceof QueryFailedError))
        return false;
    const driverError = error.driverError;
    return driverError?.code === UNIQUE_VIOLATION;
}
//# sourceMappingURL=invoices.service.js.map