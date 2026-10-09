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
import { InvoiceStatus } from '../invoice-status.js';
export class CustomerResponseDto {
    fullname;
    email;
    mobileNumber;
    address;
}
__decorate([
    ApiProperty({ example: 'Paul' }),
    __metadata("design:type", String)
], CustomerResponseDto.prototype, "fullname", void 0);
__decorate([
    ApiProperty({ example: 'paul@101digital.io' }),
    __metadata("design:type", String)
], CustomerResponseDto.prototype, "email", void 0);
__decorate([
    ApiPropertyOptional({
        example: '947717364111',
        nullable: true,
        type: String,
    }),
    __metadata("design:type", Object)
], CustomerResponseDto.prototype, "mobileNumber", void 0);
__decorate([
    ApiPropertyOptional({ example: 'Singapore', nullable: true, type: String }),
    __metadata("design:type", Object)
], CustomerResponseDto.prototype, "address", void 0);
export class InvoiceItemResponseDto {
    id;
    name;
    quantity;
    rate;
    amount;
}
__decorate([
    ApiProperty({ format: 'uuid' }),
    __metadata("design:type", String)
], InvoiceItemResponseDto.prototype, "id", void 0);
__decorate([
    ApiProperty({ example: 'Honda RC150' }),
    __metadata("design:type", String)
], InvoiceItemResponseDto.prototype, "name", void 0);
__decorate([
    ApiProperty({ example: 2 }),
    __metadata("design:type", Number)
], InvoiceItemResponseDto.prototype, "quantity", void 0);
__decorate([
    ApiProperty({ example: 1000 }),
    __metadata("design:type", Number)
], InvoiceItemResponseDto.prototype, "rate", void 0);
__decorate([
    ApiProperty({ example: 2000, description: 'quantity × rate' }),
    __metadata("design:type", Number)
], InvoiceItemResponseDto.prototype, "amount", void 0);
export class InvoiceSummaryDto {
    invoiceId;
    invoiceNumber;
    invoiceReference;
    invoiceDate;
    dueDate;
    currency;
    currencySymbol;
    status;
    customer;
    totalAmount;
    balanceAmount;
}
__decorate([
    ApiProperty({ format: 'uuid' }),
    __metadata("design:type", String)
], InvoiceSummaryDto.prototype, "invoiceId", void 0);
__decorate([
    ApiProperty({ example: 'IV1780488206995' }),
    __metadata("design:type", String)
], InvoiceSummaryDto.prototype, "invoiceNumber", void 0);
__decorate([
    ApiPropertyOptional({ example: '#5721662', nullable: true, type: String }),
    __metadata("design:type", Object)
], InvoiceSummaryDto.prototype, "invoiceReference", void 0);
__decorate([
    ApiProperty({ example: '2026-06-03', format: 'date' }),
    __metadata("design:type", String)
], InvoiceSummaryDto.prototype, "invoiceDate", void 0);
__decorate([
    ApiProperty({ example: '2026-07-03', format: 'date' }),
    __metadata("design:type", String)
], InvoiceSummaryDto.prototype, "dueDate", void 0);
__decorate([
    ApiProperty({ example: 'AUD' }),
    __metadata("design:type", String)
], InvoiceSummaryDto.prototype, "currency", void 0);
__decorate([
    ApiProperty({ example: 'AU$' }),
    __metadata("design:type", String)
], InvoiceSummaryDto.prototype, "currencySymbol", void 0);
__decorate([
    ApiProperty({
        enum: InvoiceStatus,
        description: 'Overdue is derived from dueDate when reading',
    }),
    __metadata("design:type", String)
], InvoiceSummaryDto.prototype, "status", void 0);
__decorate([
    ApiProperty({ type: CustomerResponseDto }),
    __metadata("design:type", CustomerResponseDto)
], InvoiceSummaryDto.prototype, "customer", void 0);
__decorate([
    ApiProperty({ example: 2180 }),
    __metadata("design:type", Number)
], InvoiceSummaryDto.prototype, "totalAmount", void 0);
__decorate([
    ApiProperty({ example: 728.66 }),
    __metadata("design:type", Number)
], InvoiceSummaryDto.prototype, "balanceAmount", void 0);
export class InvoiceDetailDto extends InvoiceSummaryDto {
    description;
    items;
    taxRate;
    invoiceSubTotal;
    totalTax;
    totalDiscount;
    totalPaid;
    createdAt;
    createdBy;
}
__decorate([
    ApiPropertyOptional({
        example: 'Invoice is issued to Kanglee',
        nullable: true,
        type: String,
    }),
    __metadata("design:type", Object)
], InvoiceDetailDto.prototype, "description", void 0);
__decorate([
    ApiProperty({ type: [InvoiceItemResponseDto] }),
    __metadata("design:type", Array)
], InvoiceDetailDto.prototype, "items", void 0);
__decorate([
    ApiProperty({ example: 10, description: 'Tax percentage applied' }),
    __metadata("design:type", Number)
], InvoiceDetailDto.prototype, "taxRate", void 0);
__decorate([
    ApiProperty({ example: 2000 }),
    __metadata("design:type", Number)
], InvoiceDetailDto.prototype, "invoiceSubTotal", void 0);
__decorate([
    ApiProperty({ example: 200 }),
    __metadata("design:type", Number)
], InvoiceDetailDto.prototype, "totalTax", void 0);
__decorate([
    ApiProperty({ example: 20 }),
    __metadata("design:type", Number)
], InvoiceDetailDto.prototype, "totalDiscount", void 0);
__decorate([
    ApiProperty({ example: 1451.34 }),
    __metadata("design:type", Number)
], InvoiceDetailDto.prototype, "totalPaid", void 0);
__decorate([
    ApiProperty({ example: '2026-06-03T12:03:26.995Z' }),
    __metadata("design:type", String)
], InvoiceDetailDto.prototype, "createdAt", void 0);
__decorate([
    ApiProperty({ format: 'uuid' }),
    __metadata("design:type", String)
], InvoiceDetailDto.prototype, "createdBy", void 0);
export class PagingDto {
    page;
    pageSize;
    total;
}
__decorate([
    ApiProperty({ example: 1 }),
    __metadata("design:type", Number)
], PagingDto.prototype, "page", void 0);
__decorate([
    ApiProperty({ example: 10 }),
    __metadata("design:type", Number)
], PagingDto.prototype, "pageSize", void 0);
__decorate([
    ApiProperty({ example: 42 }),
    __metadata("design:type", Number)
], PagingDto.prototype, "total", void 0);
export class InvoiceListResponseDto {
    data;
    paging;
}
__decorate([
    ApiProperty({ type: [InvoiceSummaryDto] }),
    __metadata("design:type", Array)
], InvoiceListResponseDto.prototype, "data", void 0);
__decorate([
    ApiProperty({ type: PagingDto }),
    __metadata("design:type", PagingDto)
], InvoiceListResponseDto.prototype, "paging", void 0);
//# sourceMappingURL=invoice-response.dto.js.map