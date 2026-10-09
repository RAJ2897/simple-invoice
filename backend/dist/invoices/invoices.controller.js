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
import { Body, Controller, Get, HttpCode, HttpStatus, NotFoundException, Param, ParseUUIDPipe, Post, Query, } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiConflictResponse, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse, } from '@nestjs/swagger';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { ErrorResponseDto } from '../common/dto/error-response.dto.js';
import { CreateInvoiceDto } from './dto/create-invoice.dto.js';
import { InvoiceDetailDto, InvoiceListResponseDto, } from './dto/invoice-response.dto.js';
import { ListInvoicesQueryDto } from './dto/list-invoices-query.dto.js';
import { InvoicesService } from './invoices.service.js';
const invoiceIdPipe = new ParseUUIDPipe({
    exceptionFactory: () => new NotFoundException('Invoice not found'),
});
let InvoicesController = class InvoicesController {
    invoicesService;
    constructor(invoicesService) {
        this.invoicesService = invoicesService;
    }
    findAll(query) {
        return this.invoicesService.findAll(query);
    }
    findOne(id) {
        return this.invoicesService.findOne(id);
    }
    create(dto, user) {
        return this.invoicesService.create(dto, user.id);
    }
};
__decorate([
    Get(),
    ApiOperation({
        summary: 'List invoices with search, filter, sort and pagination',
    }),
    ApiOkResponse({ type: InvoiceListResponseDto }),
    ApiBadRequestResponse({
        description: 'Invalid query parameters',
        type: ErrorResponseDto,
    }),
    __param(0, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ListInvoicesQueryDto]),
    __metadata("design:returntype", Promise)
], InvoicesController.prototype, "findAll", null);
__decorate([
    Get(':id'),
    ApiOperation({ summary: 'Get a single invoice with its line items' }),
    ApiOkResponse({ type: InvoiceDetailDto }),
    ApiNotFoundResponse({
        description: 'Invoice not found',
        type: ErrorResponseDto,
    }),
    __param(0, Param('id', invoiceIdPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InvoicesController.prototype, "findOne", null);
__decorate([
    Post(),
    HttpCode(HttpStatus.CREATED),
    ApiOperation({
        summary: 'Create a new invoice',
        description: 'The invoice is always created as Draft. All totals are calculated by the server.',
    }),
    ApiCreatedResponse({ type: InvoiceDetailDto }),
    ApiBadRequestResponse({
        description: 'Validation failed',
        type: ErrorResponseDto,
    }),
    ApiConflictResponse({
        description: 'Invoice number already exists',
        type: ErrorResponseDto,
    }),
    __param(0, Body()),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateInvoiceDto, Object]),
    __metadata("design:returntype", Promise)
], InvoicesController.prototype, "create", null);
InvoicesController = __decorate([
    ApiTags('Invoices'),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({
        description: 'Missing or invalid access token',
        type: ErrorResponseDto,
    }),
    Controller('invoices'),
    __metadata("design:paramtypes", [InvoicesService])
], InvoicesController);
export { InvoicesController };
//# sourceMappingURL=invoices.controller.js.map