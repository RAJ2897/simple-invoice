import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router'
import { INVOICE_STATUSES, type InvoiceListParams, type InvoiceStatus, type SortField, type SortOrder } from '../../types/api'

export const PAGE_SIZES = [10, 20, 50]
const SORT_FIELDS: SortField[] = ['invoiceDate', 'dueDate', 'totalAmount']

export const DEFAULT_PARAMS: InvoiceListParams = {
  page: 1,
  pageSize: 10,
  sortBy: 'invoiceDate',
  ordering: 'DESC',
}

function positiveInt(value: string | null, fallback: number) {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback
}

export function parseListParams(search: URLSearchParams): InvoiceListParams {
  const sortBy = search.get('sortBy') as SortField | null
  const ordering = search.get('ordering')?.toUpperCase() as SortOrder | undefined
  const status = search.get('status') as InvoiceStatus | null
  const pageSize = positiveInt(search.get('pageSize'), DEFAULT_PARAMS.pageSize)

  return {
    page: positiveInt(search.get('page'), 1),
    pageSize: PAGE_SIZES.includes(pageSize) ? pageSize : DEFAULT_PARAMS.pageSize,
    sortBy: sortBy && SORT_FIELDS.includes(sortBy) ? sortBy : DEFAULT_PARAMS.sortBy,
    ordering: ordering === 'ASC' || ordering === 'DESC' ? ordering : DEFAULT_PARAMS.ordering,
    status: status && INVOICE_STATUSES.includes(status) ? status : undefined,
    keyword: search.get('keyword')?.trim() || undefined,
    fromDate: search.get('fromDate') || undefined,
    toDate: search.get('toDate') || undefined,
  }
}

/**
 * List state lives in the URL so filters survive a refresh, can be bookmarked,
 * and the browser back button behaves as expected.
 */
export function useInvoiceListParams() {
  const [search, setSearch] = useSearchParams()
  const params = useMemo(() => parseListParams(search), [search])

  const update = useCallback(
    (changes: Partial<InvoiceListParams>) => {
      setSearch(
        (current) => {
          const next = { ...parseListParams(current), ...changes }
          // Any change other than paging sends the user back to the first page
          if (!('page' in changes)) next.page = 1

          const out = new URLSearchParams()
          for (const [key, value] of Object.entries(next)) {
            if (value === undefined || value === '' || value === null) continue
            if (DEFAULT_PARAMS[key as keyof InvoiceListParams] === value) continue
            out.set(key, String(value))
          }
          return out
        },
        { replace: 'page' in changes ? false : true },
      )
    },
    [setSearch],
  )

  // Clears what narrows the list but keeps the user's sort order and page size
  const reset = useCallback(
    () => update({ keyword: undefined, status: undefined, fromDate: undefined, toDate: undefined }),
    [update],
  )

  const hasFilters = Boolean(params.keyword || params.status || params.fromDate || params.toDate)

  return { params, update, reset, hasFilters }
}
