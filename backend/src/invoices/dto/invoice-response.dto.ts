import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InvoiceStatus } from '../invoice-status.js';

export class CustomerResponseDto {
  @ApiProperty({ example: 'Paul' })
  fullname: string;

  @ApiProperty({ example: 'paul@101digital.io' })
  email: string;

  @ApiPropertyOptional({
    example: '947717364111',
    nullable: true,
    type: String,
  })
  mobileNumber: string | null;

  @ApiPropertyOptional({ example: 'Singapore', nullable: true, type: String })
  address: string | null;
}

export class InvoiceItemResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'Honda RC150' })
  name: string;

  @ApiProperty({ example: 2 })
  quantity: number;

  @ApiProperty({ example: 1000 })
  rate: number;

  @ApiProperty({ example: 2000, description: 'quantity × rate' })
  amount: number;
}

export class InvoiceSummaryDto {
  @ApiProperty({ format: 'uuid' })
  invoiceId: string;

  @ApiProperty({ example: 'IV1780488206995' })
  invoiceNumber: string;

  @ApiPropertyOptional({ example: '#5721662', nullable: true, type: String })
  invoiceReference: string | null;

  @ApiProperty({ example: '2026-06-03', format: 'date' })
  invoiceDate: string;

  @ApiProperty({ example: '2026-07-03', format: 'date' })
  dueDate: string;

  @ApiProperty({ example: 'AUD' })
  currency: string;

  @ApiProperty({ example: 'AU$' })
  currencySymbol: string;

  @ApiProperty({
    enum: InvoiceStatus,
    description: 'Overdue is derived from dueDate when reading',
  })
  status: InvoiceStatus;

  @ApiProperty({ type: CustomerResponseDto })
  customer: CustomerResponseDto;

  @ApiProperty({ example: 2180 })
  totalAmount: number;

  @ApiProperty({ example: 728.66 })
  balanceAmount: number;
}

export class InvoiceDetailDto extends InvoiceSummaryDto {
  @ApiPropertyOptional({
    example: 'Invoice is issued to Kanglee',
    nullable: true,
    type: String,
  })
  description: string | null;

  @ApiProperty({ type: [InvoiceItemResponseDto] })
  items: InvoiceItemResponseDto[];

  @ApiProperty({ example: 10, description: 'Tax percentage applied' })
  taxRate: number;

  @ApiProperty({ example: 2000 })
  invoiceSubTotal: number;

  @ApiProperty({ example: 200 })
  totalTax: number;

  @ApiProperty({ example: 20 })
  totalDiscount: number;

  @ApiProperty({ example: 1451.34 })
  totalPaid: number;

  @ApiProperty({ example: '2026-06-03T12:03:26.995Z' })
  createdAt: string;

  @ApiProperty({ format: 'uuid' })
  createdBy: string;
}

export class PagingDto {
  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  pageSize: number;

  @ApiProperty({ example: 42 })
  total: number;
}

export class InvoiceListResponseDto {
  @ApiProperty({ type: [InvoiceSummaryDto] })
  data: InvoiceSummaryDto[];

  @ApiProperty({ type: PagingDto })
  paging: PagingDto;
}
