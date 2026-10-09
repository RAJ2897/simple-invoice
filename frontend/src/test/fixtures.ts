import type { InvoiceDetail, InvoiceSummary, Paged } from '../types/api'

export const summary = (overrides: Partial<InvoiceSummary> = {}): InvoiceSummary => ({
  invoiceId: '099ca7da-a290-40fa-93b9-1c43ae7bb887',
  invoiceNumber: 'IV1780488206995',
  invoiceReference: '#5721662',
  invoiceDate: '2026-06-03',
  dueDate: '2026-07-03',
  currency: 'AUD',
  currencySymbol: 'AU$',
  status: 'Overdue',
  customer: { fullname: 'Paul', email: 'paul@101digital.io', mobileNumber: '947717364111', address: 'Singapore' },
  totalAmount: 2180,
  balanceAmount: 728.66,
  ...overrides,
})

export const detail = (overrides: Partial<InvoiceDetail> = {}): InvoiceDetail => ({
  ...summary(),
  description: 'Invoice is issued to Kanglee',
  items: [{ id: 'b1c2d3e4-0000-0000-0000-000000000001', name: 'Honda RC150', quantity: 2, rate: 1000, amount: 2000 }],
  taxRate: 10,
  invoiceSubTotal: 2000,
  totalTax: 200,
  totalDiscount: 20,
  totalPaid: 1451.34,
  createdAt: '2026-06-03T12:03:26.995Z',
  createdBy: 'ad1e0902-1928-4345-b513-60c86c94fc91',
  ...overrides,
})

export const page = (data: InvoiceSummary[], total = data.length, pageSize = 10, pageNo = 1): Paged<InvoiceSummary> => ({
  data,
  paging: { page: pageNo, pageSize, total },
})
