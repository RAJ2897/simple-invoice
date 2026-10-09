import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ApiError } from '../api/client'
import { fetchInvoices } from '../api/invoices'
import { page, summary } from '../test/fixtures'
import { renderApp, signIn } from '../test/render'

vi.mock('../api/invoices')

const lastParams = () => vi.mocked(fetchInvoices).mock.lastCall?.[0]

describe('InvoiceListPage', () => {
  beforeEach(() => {
    signIn()
    vi.mocked(fetchInvoices).mockResolvedValue(
      page(
        [
          summary(),
          summary({
            invoiceId: '2b7c1d60-0000-4000-8000-000000000002',
            invoiceNumber: 'INV-2026-0002',
            invoiceReference: null,
            status: 'Paid',
            customer: { fullname: 'Acme Corp', email: 'ap@acme.test', mobileNumber: null, address: null },
            totalAmount: 99.5,
            balanceAmount: 0,
          }),
        ],
        42,
      ),
    )
  })

  it('shows the key columns for every invoice', async () => {
    renderApp('/invoices')

    const row = await screen.findByRole('link', { name: 'Open invoice IV1780488206995' })
    expect(row).toHaveTextContent('Paul')
    expect(row).toHaveTextContent('3 Jun 2026')
    expect(row).toHaveTextContent('3 Jul 2026')
    expect(row).toHaveTextContent('AU$2,180.00')
    expect(row).toHaveTextContent('Overdue')
    expect(screen.getByText('Showing 1–10 of 42')).toBeInTheDocument()
    expect(lastParams()).toEqual({ page: 1, pageSize: 10, sortBy: 'invoiceDate', ordering: 'DESC' })
  })

  it('sends search, status and sort to the server and resets to page 1', async () => {
    const user = userEvent.setup()
    const { router } = renderApp('/invoices?page=3')
    await screen.findByRole('link', { name: 'Open invoice IV1780488206995' })
    expect(lastParams()?.page).toBe(3)

    await user.type(screen.getByRole('textbox', { name: 'Search invoices' }), 'acme')
    await waitFor(() => expect(lastParams()).toMatchObject({ keyword: 'acme', page: 1 }))

    await user.click(screen.getByRole('radio', { name: 'Paid' }))
    await waitFor(() => expect(lastParams()).toMatchObject({ keyword: 'acme', status: 'Paid', page: 1 }))

    const query = new URLSearchParams(router.state.location.search)
    expect(Object.fromEntries(query)).toEqual({ keyword: 'acme', status: 'Paid' })
  })

  it('pages through results', async () => {
    const user = userEvent.setup()
    renderApp('/invoices')
    await screen.findByRole('link', { name: 'Open invoice IV1780488206995' })

    await user.click(screen.getByRole('button', { name: '2' }))
    await waitFor(() => expect(lastParams()).toMatchObject({ page: 2, pageSize: 10 }))
  })

  it('opens the detail page when a row is clicked', async () => {
    const user = userEvent.setup()
    const { router } = renderApp('/invoices')

    await user.click(await screen.findByRole('link', { name: 'Open invoice INV-2026-0002' }))
    expect(router.state.location.pathname).toBe('/invoices/2b7c1d60-0000-4000-8000-000000000002')
  })

  it('explains when nothing matches the filters', async () => {
    vi.mocked(fetchInvoices).mockResolvedValue(page([]))
    renderApp('/invoices?keyword=nothing')

    expect(await screen.findByText('No invoices found')).toBeInTheDocument()
    expect(screen.getByText('Try a different search or clear the filters.')).toBeInTheDocument()
  })

  it('shows an error with a retry button when the request fails', async () => {
    vi.mocked(fetchInvoices).mockRejectedValue(new ApiError(500, ['Internal server error']))
    renderApp('/invoices')

    expect(await screen.findByText('Could not load invoices')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument()
  })
})
