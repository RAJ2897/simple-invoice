import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser, type AuthUser } from '../auth/current-user.decorator.js';
import { ErrorResponseDto } from '../common/dto/error-response.dto.js';
import { CreateInvoiceDto } from './dto/create-invoice.dto.js';
import {
  InvoiceDetailDto,
  InvoiceListResponseDto,
} from './dto/invoice-response.dto.js';
import { ListInvoicesQueryDto } from './dto/list-invoices-query.dto.js';
import { InvoicesService } from './invoices.service.js';

const invoiceIdPipe = new ParseUUIDPipe({
  exceptionFactory: () => new NotFoundException('Invoice not found'),
});

@ApiTags('Invoices')
@ApiBearerAuth()
@ApiUnauthorizedResponse({
  description: 'Missing or invalid access token',
  type: ErrorResponseDto,
})
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get()
  @ApiOperation({
    summary: 'List invoices with search, filter, sort and pagination',
  })
  @ApiOkResponse({ type: InvoiceListResponseDto })
  @ApiBadRequestResponse({
    description: 'Invalid query parameters',
    type: ErrorResponseDto,
  })
  findAll(
    @Query() query: ListInvoicesQueryDto,
  ): Promise<InvoiceListResponseDto> {
    return this.invoicesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single invoice with its line items' })
  @ApiOkResponse({ type: InvoiceDetailDto })
  @ApiNotFoundResponse({
    description: 'Invoice not found',
    type: ErrorResponseDto,
  })
  findOne(@Param('id', invoiceIdPipe) id: string): Promise<InvoiceDetailDto> {
    return this.invoicesService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new invoice',
    description:
      'The invoice is always created as Draft. All totals are calculated by the server.',
  })
  @ApiCreatedResponse({ type: InvoiceDetailDto })
  @ApiBadRequestResponse({
    description: 'Validation failed',
    type: ErrorResponseDto,
  })
  @ApiConflictResponse({
    description: 'Invoice number already exists',
    type: ErrorResponseDto,
  })
  create(
    @Body() dto: CreateInvoiceDto,
    @CurrentUser() user: AuthUser,
  ): Promise<InvoiceDetailDto> {
    return this.invoicesService.create(dto, user.id);
  }
}
