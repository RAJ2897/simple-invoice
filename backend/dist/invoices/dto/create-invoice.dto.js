var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsDefined, IsEmail, IsIn, IsInt, IsNotEmpty, IsNumber, IsObject, IsOptional, IsPositive, IsString, MaxLength, Min, ValidateNested, } from 'class-validator';
import { IsIsoDate } from '../../common/validators/is-iso-date.js';
import { IsOnOrAfter } from '../../common/validators/is-on-or-after.js';
import { SUPPORTED_CURRENCIES } from '../currencies.js';
const required = { message: '$property is required' };
const trim = ({ value }) => typeof value === 'string' ? value.trim() : value;
const trimToUndefined = ({ value }) => {
    if (typeof value !== 'string')
        return value;
    const trimmed = value.trim();
    return trimmed === '' ? undefined : trimmed;
};
export class CustomerDto {
    fullname;
    email;
    mobileNumber;
    address;
}
__decorate([
    ApiProperty({ example: 'Paul' }),
    Transform(trim),
    MaxLength(150),
    IsString(),
    IsNotEmpty(required),
    __metadata("design:type", String)
], CustomerDto.prototype, "fullname", void 0);
__decorate([
    ApiProperty({ example: 'paul@101digital.io' }),
    Transform(trim),
    MaxLength(254),
    IsEmail({}, { message: '$property must be a valid email address' }),
    IsNotEmpty(required),
    __metadata("design:type", String)
], CustomerDto.prototype, "email", void 0);
__decorate([
    ApiPropertyOptional({ example: '947717364111' }),
    Transform(trimToUndefined),
    MaxLength(30),
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], CustomerDto.prototype, "mobileNumber", void 0);
__decorate([
    ApiPropertyOptional({ example: 'Singapore' }),
    Transform(trimToUndefined),
    MaxLength(500),
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], CustomerDto.prototype, "address", void 0);
export class InvoiceItemDto {
    name;
    quantity;
    rate;
}
__decorate([
    ApiProperty({ example: 'Honda RC150' }),
    Transform(trim),
    MaxLength(200),
    IsString(),
    IsNotEmpty(required),
    __metadata("design:type", String)
], InvoiceItemDto.prototype, "name", void 0);
__decorate([
    ApiProperty({ example: 2, minimum: 1 }),
    IsPositive(),
    IsInt({ message: '$property must be a whole number' }),
    IsDefined(required),
    __metadata("design:type", Number)
], InvoiceItemDto.prototype, "quantity", void 0);
__decorate([
    ApiProperty({
        example: 1000,
        description: 'Unit price, up to 2 decimal places',
    }),
    IsPositive(),
    IsNumber({ maxDecimalPlaces: 2 }, { message: '$property must be a number with at most 2 decimals' }),
    IsDefined(required),
    __metadata("design:type", Number)
], InvoiceItemDto.prototype, "rate", void 0);
export class CreateInvoiceDto {
    invoiceNumber;
    invoiceReference;
    invoiceDate;
    dueDate;
    currency;
    description;
    customer;
    items;
    taxRate;
    discount;
}
__decorate([
    ApiProperty({ example: 'INV-2026-0101', description: 'Must be unique' }),
    Transform(trim),
    MaxLength(50),
    IsString(),
    IsNotEmpty(required),
    __metadata("design:type", String)
], CreateInvoiceDto.prototype, "invoiceNumber", void 0);
__decorate([
    ApiPropertyOptional({ example: '#5721662' }),
    Transform(trimToUndefined),
    MaxLength(100),
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], CreateInvoiceDto.prototype, "invoiceReference", void 0);
__decorate([
    ApiProperty({ example: '2026-06-03', format: 'date' }),
    IsIsoDate(),
    IsNotEmpty(required),
    __metadata("design:type", String)
], CreateInvoiceDto.prototype, "invoiceDate", void 0);
__decorate([
    ApiProperty({
        example: '2026-07-03',
        format: 'date',
        description: 'Must be on or after invoiceDate',
    }),
    IsOnOrAfter('invoiceDate'),
    IsIsoDate(),
    IsNotEmpty(required),
    __metadata("design:type", String)
], CreateInvoiceDto.prototype, "dueDate", void 0);
__decorate([
    ApiProperty({ example: 'AUD', enum: SUPPORTED_CURRENCIES }),
    Transform(({ value }) => typeof value === 'string' ? value.trim().toUpperCase() : value),
    IsIn(SUPPORTED_CURRENCIES, {
        message: `currency must be one of: ${SUPPORTED_CURRENCIES.join(', ')}`,
    }),
    IsNotEmpty(required),
    __metadata("design:type", String)
], CreateInvoiceDto.prototype, "currency", void 0);
__decorate([
    ApiPropertyOptional({ example: 'Invoice is issued to Kanglee' }),
    Transform(trimToUndefined),
    MaxLength(1000),
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], CreateInvoiceDto.prototype, "description", void 0);
__decorate([
    ApiProperty({ type: CustomerDto }),
    ValidateNested(),
    Type(() => CustomerDto),
    IsObject(),
    IsDefined(required),
    __metadata("design:type", CustomerDto)
], CreateInvoiceDto.prototype, "customer", void 0);
__decorate([
    ApiProperty({
        type: [InvoiceItemDto],
        description: 'Exactly one line item is supported for now',
    }),
    ValidateNested({ each: true }),
    Type(() => InvoiceItemDto),
    ArrayMaxSize(1, { message: 'items must contain exactly one line item' }),
    ArrayMinSize(1, { message: 'items must contain exactly one line item' }),
    IsArray(),
    IsDefined(required),
    __metadata("design:type", Array)
], CreateInvoiceDto.prototype, "items", void 0);
__decorate([
    ApiPropertyOptional({
        example: 10,
        default: 10,
        description: 'Tax percentage',
    }),
    Min(0),
    IsNumber({ maxDecimalPlaces: 2 }),
    IsOptional(),
    __metadata("design:type", Number)
], CreateInvoiceDto.prototype, "taxRate", void 0);
__decorate([
    ApiPropertyOptional({
        example: 20,
        default: 0,
        description: 'Flat discount amount',
    }),
    Min(0),
    IsNumber({ maxDecimalPlaces: 2 }),
    IsOptional(),
    __metadata("design:type", Number)
], CreateInvoiceDto.prototype, "discount", void 0);
//# sourceMappingURL=create-invoice.dto.js.map