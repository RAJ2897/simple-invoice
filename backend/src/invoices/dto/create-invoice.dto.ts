import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsDefined,
  IsEmail,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { IsIsoDate } from '../../common/validators/is-iso-date.js';
import { IsOnOrAfter } from '../../common/validators/is-on-or-after.js';
import { SUPPORTED_CURRENCIES } from '../currencies.js';

/*
 * class-validator evaluates decorators bottom-up and the ValidationPipe stops at
 * the first failure per field, so the "is required" check sits at the bottom.
 */

const required = { message: '$property is required' };

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;
const trimToUndefined = ({ value }: { value: unknown }) => {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
};

export class CustomerDto {
  @ApiProperty({ example: 'Paul' })
  @Transform(trim)
  @MaxLength(150)
  @IsString()
  @IsNotEmpty(required)
  fullname: string;

  @ApiProperty({ example: 'paul@101digital.io' })
  @Transform(trim)
  @MaxLength(254)
  @IsEmail({}, { message: '$property must be a valid email address' })
  @IsNotEmpty(required)
  email: string;

  @ApiPropertyOptional({ example: '947717364111' })
  @Transform(trimToUndefined)
  @MaxLength(30)
  @IsString()
  @IsOptional()
  mobileNumber?: string;

  @ApiPropertyOptional({ example: 'Singapore' })
  @Transform(trimToUndefined)
  @MaxLength(500)
  @IsString()
  @IsOptional()
  address?: string;
}

export class InvoiceItemDto {
  @ApiProperty({ example: 'Honda RC150' })
  @Transform(trim)
  @MaxLength(200)
  @IsString()
  @IsNotEmpty(required)
  name: string;

  @ApiProperty({ example: 2, minimum: 1 })
  @IsPositive()
  @IsInt({ message: '$property must be a whole number' })
  @IsDefined(required)
  quantity: number;

  @ApiProperty({
    example: 1000,
    description: 'Unit price, up to 2 decimal places',
  })
  @IsPositive()
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: '$property must be a number with at most 2 decimals' },
  )
  @IsDefined(required)
  rate: number;
}

export class CreateInvoiceDto {
  @ApiProperty({ example: 'INV-2026-0101', description: 'Must be unique' })
  @Transform(trim)
  @MaxLength(50)
  @IsString()
  @IsNotEmpty(required)
  invoiceNumber: string;

  @ApiPropertyOptional({ example: '#5721662' })
  @Transform(trimToUndefined)
  @MaxLength(100)
  @IsString()
  @IsOptional()
  invoiceReference?: string;

  @ApiProperty({ example: '2026-06-03', format: 'date' })
  @IsIsoDate()
  @IsNotEmpty(required)
  invoiceDate: string;

  @ApiProperty({
    example: '2026-07-03',
    format: 'date',
    description: 'Must be on or after invoiceDate',
  })
  @IsOnOrAfter('invoiceDate')
  @IsIsoDate()
  @IsNotEmpty(required)
  dueDate: string;

  @ApiProperty({ example: 'AUD', enum: SUPPORTED_CURRENCIES })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  @IsIn(SUPPORTED_CURRENCIES, {
    message: `currency must be one of: ${SUPPORTED_CURRENCIES.join(', ')}`,
  })
  @IsNotEmpty(required)
  currency: string;

  @ApiPropertyOptional({ example: 'Invoice is issued to Kanglee' })
  @Transform(trimToUndefined)
  @MaxLength(1000)
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ type: CustomerDto })
  @ValidateNested()
  @Type(() => CustomerDto)
  @IsObject()
  @IsDefined(required)
  customer: CustomerDto;

  @ApiProperty({
    type: [InvoiceItemDto],
    description: 'Exactly one line item is supported for now',
  })
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemDto)
  @ArrayMaxSize(1, { message: 'items must contain exactly one line item' })
  @ArrayMinSize(1, { message: 'items must contain exactly one line item' })
  @IsArray()
  @IsDefined(required)
  items: InvoiceItemDto[];

  @ApiPropertyOptional({
    example: 10,
    default: 10,
    description: 'Tax percentage',
  })
  @Min(0)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  taxRate?: number;

  @ApiPropertyOptional({
    example: 20,
    default: 0,
    description: 'Flat discount amount',
  })
  @Min(0)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  discount?: number;
}
