import { DEFAULT_PARAMS, parseListParams } from './useInvoiceListParams'

const parse = (query: string) => parseListParams(new URLSearchParams(query))

describe('parseListParams', () => {
  it('falls back to the defaults for an empty query', () => {
    expect(parse('')).toEqual({ ...DEFAULT_PARAMS, status: undefined, keyword: undefined, fromDate: undefined, toDate: undefined })
  })

  it('reads every supported parameter', () => {
    expect(
      parse('page=3&pageSize=20&sortBy=totalAmount&ordering=asc&status=Overdue&keyword=%20acme%20&fromDate=2026-01-01&toDate=2026-02-01'),
    ).toEqual({
      page: 3,
      pageSize: 20,
      sortBy: 'totalAmount',
      ordering: 'ASC',
      status: 'Overdue',
      keyword: 'acme',
      fromDate: '2026-01-01',
      toDate: '2026-02-01',
    })
  })

  it('ignores values the API would reject', () => {
    expect(parse('page=-2&pageSize=7&sortBy=customer&ordering=sideways&status=Lost')).toMatchObject({
      page: 1,
      pageSize: 10,
      sortBy: 'invoiceDate',
      ordering: 'DESC',
      status: undefined,
    })
  })
})
