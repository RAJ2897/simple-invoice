export type InvoiceStatus = 'Draft' | 'Pending' | 'Paid' | 'Overdue'

export const INVOICE_STATUSES: InvoiceStatus[] = ['Draft', 'Pending', 'Paid', 'Overdue']

export type SortField = 'invoiceDate' | 'dueDate' | 'totalAmount'
export type SortOrder = 'ASC' | 'DESC'

export interface Customer {
  fullname: string
  email: string
  mobileNumber: string | null
  address: string | null
}

export interface InvoiceSummary {
  invoiceId: string
  invoiceNumber: string
  invoiceReference: string | null
  invoiceDate: string
  dueDate: string
  currency: string
  currencySymbol: string
  status: InvoiceStatus
  customer: Customer
  totalAmount: number
  balanceAmount: number
}

export interface InvoiceItem {
  id: string
  name: string
  quantity: number
  rate: number
  amount: number
}

export interface InvoiceDetail extends InvoiceSummary {
  description: string | null
  items: InvoiceItem[]
  taxRate: number
  invoiceSubTotal: number
  totalTax: number
  totalDiscount: number
  totalPaid: number
  createdAt: string
  createdBy: string
}

export interface Paged<T> {
  data: T[]
  paging: { page: number; pageSize: number; total: number }
}

export interface InvoiceListParams {
  page: number
  pageSize: number
  sortBy: SortField
  ordering: SortOrder
  status?: InvoiceStatus
  keyword?: string
  fromDate?: string
  toDate?: string
}

export interface CreateInvoicePayload {
  invoiceNumber: string
  invoiceReference?: string
  invoiceDate: string
  dueDate: string
  currency: string
  description?: string
  customer: {
    fullname: string
    email: string
    mobileNumber?: string
    address?: string
  }
  items: Array<{ name: string; quantity: number; rate: number }>
  taxRate: number
  discount: number
}

export interface UserProfile {
  id: string
  email: string
  fullname: string
  createdAt: string
}

export interface LoginResponse {
  accessToken: string
  tokenType: 'Bearer'
  expiresIn: number
  user: UserProfile
}
