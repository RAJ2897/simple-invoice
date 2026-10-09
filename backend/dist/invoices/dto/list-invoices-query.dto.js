var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsEnum, IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min, } from 'class-validator';
import { IsIsoDate } from '../../common/validators/is-iso-date.js';
import { IsOnOrAfter } from '../../common/validators/is-on-or-after.js';
import { InvoiceStatus } from '../invoice-status.js';
export const INVOICE_SORT_FIELDS = [
    'invoiceDate',
    'dueDate',
    'totalAmount',
];
const emptyToUndefined = ({ value }) => typeof value === 'string' && value.trim() === '' ? undefined : value;
export class ListInvoicesQueryDto {
    page = 1;
    pageSize = 10;
    sortBy = 'invoiceDate';
    ordering = 'DESC';
    status;
    keyword;
    fromDate;
    toDate;
}
__decorate([
    ApiPropertyOptional({ default: 1, minimum: 1 }),
    IsOptional(),
    Type(() => Number),
    IsInt(),
    Min(1),
    __metadata("design:type", Number)
], ListInvoicesQueryDto.prototype, "page", void 0);
__decorate([
    ApiPropertyOptional({ default: 10, minimum: 1, maximum: 100 }),
    IsOptional(),
    Type(() => Number),
    IsInt(),
    Min(1),
    Max(100),
    __metadata("design:type", Number)
], ListInvoicesQueryDto.prototype, "pageSize", void 0);
__decorate([
    ApiPropertyOptional({ enum: INVOICE_SORT_FIELDS, default: 'invoiceDate' }),
    IsOptional(),
    IsIn(INVOICE_SORT_FIELDS),
    __metadata("design:type", String)
], ListInvoicesQueryDto.prototype, "sortBy", void 0);
__decorate([
    ApiPropertyOptional({ enum: ['ASC', 'DESC'], default: 'DESC' }),
    IsOptional(),
    Transform(({ value }) => typeof value === 'string' ? value.toUpperCase() : value),
    IsIn(['ASC', 'DESC']),
    __metadata("design:type", String)
], ListInvoicesQueryDto.prototype, "ordering", void 0);
__decorate([
    ApiPropertyOptional({ enum: InvoiceStatus }),
    IsOptional(),
    Transform(emptyToUndefined),
    IsEnum(InvoiceStatus),
    __metadata("design:type", String)
], ListInvoicesQueryDto.prototype, "status", void 0);
__decorate([
    ApiPropertyOptional({
        description: 'Partial, case-insensitive match on invoice number or customer name',
    }),
    IsOptional(),
    Transform(({ value }) => typeof value === 'string' ? value.trim() || undefined : value),
    IsString(),
    MaxLength(100),
    __metadata("design:type", String)
], ListInvoicesQueryDto.prototype, "keyword", void 0);
__decorate([
    ApiPropertyOptional({
        format: 'date',
        description: 'Invoices dated on or after this day (YYYY-MM-DD)',
    }),
    IsOptional(),
    Transform(emptyToUndefined),
    IsIsoDate(),
    __metadata("design:type", String)
], ListInvoicesQueryDto.prototype, "fromDate", void 0);
__decorate([
    ApiPropertyOptional({
        format: 'date',
        description: 'Invoices dated on or before this day (YYYY-MM-DD)',
    }),
    IsOptional(),
    Transform(emptyToUndefined),
    IsIsoDate(),
    IsOnOrAfter('fromDate'),
    __metadata("design:type", String)
], ListInvoicesQueryDto.prototype, "toDate", void 0);
//# sourceMappingURL=list-invoices-query.dto.js.map