import type {
  CreateInvoicePayload,
  InvoiceDetail,
  InvoiceListParams,
  InvoiceSummary,
  Paged,
} from '../types/api'
import { api } from './client'

export async function fetchInvoices(params: InvoiceListParams): Promise<Paged<InvoiceSummary>> {
  const { data } = await api.get<Paged<InvoiceSummary>>('/invoices', { params })
  return data
}

export async function fetchInvoice(id: string): Promise<InvoiceDetail> {
  const { data } = await api.get<InvoiceDetail>(`/invoices/${id}`)
  return data
}

export async function createInvoice(payload: CreateInvoicePayload): Promise<InvoiceDetail> {
  const { data } = await api.post<InvoiceDetail>('/invoices', payload)
  return data
}
