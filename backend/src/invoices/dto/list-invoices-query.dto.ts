import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { IsIsoDate } from '../../common/validators/is-iso-date.js';
import { IsOnOrAfter } from '../../common/validators/is-on-or-after.js';
import { InvoiceStatus } from '../invoice-status.js';

export const INVOICE_SORT_FIELDS = [
  'invoiceDate',
  'dueDate',
  'totalAmount',
] as const;
export type InvoiceSortField = (typeof INVOICE_SORT_FIELDS)[number];

const emptyToUndefined = ({ value }: { value: unknown }) =>
  typeof value === 'string' && value.trim() === '' ? undefined : value;

export class ListInvoicesQueryDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ default: 10, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize: number = 10;

  @ApiPropertyOptional({ enum: INVOICE_SORT_FIELDS, default: 'invoiceDate' })
  @IsOptional()
  @IsIn(INVOICE_SORT_FIELDS)
  sortBy: InvoiceSortField = 'invoiceDate';

  @ApiPropertyOptional({ enum: ['ASC', 'DESC'], default: 'DESC' })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.toUpperCase() : value,
  )
  @IsIn(['ASC', 'DESC'])
  ordering: 'ASC' | 'DESC' = 'DESC';

  @ApiPropertyOptional({ enum: InvoiceStatus })
  @IsOptional()
  @Transform(emptyToUndefined)
  @IsEnum(InvoiceStatus)
  status?: InvoiceStatus;

  @ApiPropertyOptional({
    description:
      'Partial, case-insensitive match on invoice number or customer name',
  })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() || undefined : value,
  )
  @IsString()
  @MaxLength(100)
  keyword?: string;

  @ApiPropertyOptional({
    format: 'date',
    description: 'Invoices dated on or after this day (YYYY-MM-DD)',
  })
  @IsOptional()
  @Transform(emptyToUndefined)
  @IsIsoDate()
  fromDate?: string;

  @ApiPropertyOptional({
    format: 'date',
    description: 'Invoices dated on or before this day (YYYY-MM-DD)',
  })
  @IsOptional()
  @Transform(emptyToUndefined)
  @IsIsoDate()
  @IsOnOrAfter('fromDate')
  toDate?: string;
}
