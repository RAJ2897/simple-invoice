import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  QueryFailedError,
  type Repository,
  type SelectQueryBuilder,
} from 'typeorm';
import { todayIsoDate } from '../common/utils/date.js';
import { CURRENCY_SYMBOLS } from './currencies.js';
import type { CreateInvoiceDto } from './dto/create-invoice.dto.js';
import type {
  InvoiceDetailDto,
  InvoiceListResponseDto,
} from './dto/invoice-response.dto.js';
import type {
  InvoiceSortField,
  ListInvoicesQueryDto,
} from './dto/list-invoices-query.dto.js';
import { Invoice } from './entities/invoice.entity.js';
import { calculateInvoiceAmounts } from './invoice-calculator.js';
import { InvoiceStatus, PersistedInvoiceStatus } from './invoice-status.js';
import { toInvoiceDetail, toInvoiceSummary } from './invoice.mapper.js';

export const DEFAULT_TAX_RATE = 10;

const SORT_COLUMNS: Record<InvoiceSortField, string> = {
  invoiceDate: 'invoice.invoiceDate',
  dueDate: 'invoice.dueDate',
  totalAmount: 'invoice.totalAmount',
};

const UNIQUE_VIOLATION = '23505';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoices: Repository<Invoice>,
  ) {}

  async findAll(query: ListInvoicesQueryDto): Promise<InvoiceListResponseDto> {
    const today = todayIsoDate();
    const { page, pageSize, sortBy, ordering } = query;

    const qb = this.invoices.createQueryBuilder('invoice');
    this.applyFilters(qb, query, today);

    const [rows, total] = await qb
      .orderBy(SORT_COLUMNS[sortBy], ordering)
      // tie-breaker so paging is stable when many rows share the same sort value
      .addOrderBy('invoice.invoiceNumber', 'ASC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    return {
      data: rows.map((row) => toInvoiceSummary(row, today)),
      paging: { page, pageSize, total },
    };
  }

  async findOne(invoiceId: string): Promise<InvoiceDetailDto> {
    const invoice = await this.invoices.findOne({
      where: { invoiceId },
      relations: { items: true },
    });
    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }
    return toInvoiceDetail(invoice, todayIsoDate());
  }

  async create(
    dto: CreateInvoiceDto,
    userId: string,
  ): Promise<InvoiceDetailDto> {
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
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException(
          `Invoice number "${dto.invoiceNumber}" already exists`,
        );
      }
      throw error;
    }
  }

  private applyFilters(
    qb: SelectQueryBuilder<Invoice>,
    query: ListInvoicesQueryDto,
    today: string,
  ) {
    if (query.keyword) {
      qb.andWhere(
        '(invoice.invoiceNumber ILIKE :keyword OR invoice.customerFullname ILIKE :keyword)',
        { keyword: `%${escapeLike(query.keyword)}%` },
      );
    }

    // Overdue only exists at read time, so each status filter has to agree with
    // deriveInvoiceStatus(); otherwise an overdue Pending invoice would show up
    // under both "Pending" and "Overdue".
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
}

function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (char) => `\\${char}`);
}

function isUniqueViolation(error: unknown): boolean {
  if (!(error instanceof QueryFailedError)) return false;
  const driverError = error.driverError as { code?: string } | undefined;
  return driverError?.code === UNIQUE_VIOLATION;
}
