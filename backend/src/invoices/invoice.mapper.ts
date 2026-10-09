import { Decimal } from 'decimal.js';
import type { Invoice } from './entities/invoice.entity.js';
import type {
  InvoiceDetailDto,
  InvoiceSummaryDto,
} from './dto/invoice-response.dto.js';
import { deriveInvoiceStatus } from './invoice-status.js';

export function toInvoiceSummary(
  invoice: Invoice,
  today: string,
): InvoiceSummaryDto {
  return {
    invoiceId: invoice.invoiceId,
    invoiceNumber: invoice.invoiceNumber,
    invoiceReference: invoice.invoiceReference,
    invoiceDate: invoice.invoiceDate,
    dueDate: invoice.dueDate,
    currency: invoice.currency,
    currencySymbol: invoice.currencySymbol,
    status: deriveInvoiceStatus(invoice.status, invoice.dueDate, today),
    customer: {
      fullname: invoice.customerFullname,
      email: invoice.customerEmail,
      mobileNumber: invoice.customerMobile,
      address: invoice.customerAddress,
    },
    totalAmount: invoice.totalAmount,
    balanceAmount: invoice.balanceAmount,
  };
}

export function toInvoiceDetail(
  invoice: Invoice,
  today: string,
): InvoiceDetailDto {
  return {
    ...toInvoiceSummary(invoice, today),
    description: invoice.description,
    items: (invoice.items ?? []).map((item) => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      rate: item.rate,
      amount: new Decimal(item.quantity)
        .times(item.rate)
        .toDecimalPlaces(2)
        .toNumber(),
    })),
    taxRate: invoice.taxRate,
    invoiceSubTotal: invoice.invoiceSubTotal,
    totalTax: invoice.totalTax,
    totalDiscount: invoice.totalDiscount,
    totalPaid: invoice.totalPaid,
    createdAt: invoice.createdAt.toISOString(),
    createdBy: invoice.createdBy,
  };
}
