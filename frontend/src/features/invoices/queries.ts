import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createInvoice, fetchInvoice, fetchInvoices } from '../../api/invoices'
import type { CreateInvoicePayload, InvoiceListParams } from '../../types/api'

export const invoiceKeys = {
  all: ['invoices'] as const,
  list: (params: InvoiceListParams) => [...invoiceKeys.all, 'list', params] as const,
  detail: (id: string) => [...invoiceKeys.all, 'detail', id] as const,
}

export function useInvoiceList(params: InvoiceListParams) {
  return useQuery({
    queryKey: invoiceKeys.list(params),
    queryFn: () => fetchInvoices(params),
    // keep the current page on screen while the next one loads
    placeholderData: keepPreviousData,
  })
}

export function useInvoice(id: string) {
  return useQuery({
    queryKey: invoiceKeys.detail(id),
    queryFn: () => fetchInvoice(id),
  })
}

export function useCreateInvoice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateInvoicePayload) => createInvoice(payload),
    onSuccess: (invoice) => {
      queryClient.setQueryData(invoiceKeys.detail(invoice.invoiceId), invoice)
      return queryClient.invalidateQueries({ queryKey: [...invoiceKeys.all, 'list'] })
    },
  })
}
