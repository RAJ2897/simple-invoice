import { screen, within } from '@testing-library/react'
import { ApiError } from '../api/client'
import { fetchInvoice } from '../api/invoices'
import { detail } from '../test/fixtures'
import { renderApp, signIn } from '../test/render'

vi.mock('../api/invoices')

describe('InvoiceDetailPage', () => {
  beforeEach(signIn)

  it('shows invoice, customer, line item and the server-calculated totals', async () => {
    vi.mocked(fetchInvoice).mockResolvedValue(detail())
    renderApp('/invoices/099ca7da-a290-40fa-93b9-1c43ae7bb887')

    expect(await screen.findByRole('heading', { name: 'IV1780488206995' })).toBeInTheDocument()
    expect(fetchInvoice).toHaveBeenCalledWith('099ca7da-a290-40fa-93b9-1c43ae7bb887')
    expect(screen.getByText('#5721662')).toBeInTheDocument()
    expect(screen.getByText('paul@101digital.io')).toBeInTheDocument()
    expect(screen.getByText('Singapore')).toBeInTheDocument()
    expect(screen.getByText('Honda RC150')).toBeInTheDocument()

    const totals = within(screen.getByLabelText('Invoice totals'))
    expect(totals.getByText('AU$2,000.00')).toBeInTheDocument()
    expect(totals.getByText('Tax (10%)')).toBeInTheDocument()
    expect(totals.getByText('AU$200.00')).toBeInTheDocument()
    expect(totals.getByText('-AU$20.00')).toBeInTheDocument()
    expect(totals.getByText('AU$2,180.00')).toBeInTheDocument()
    expect(totals.getByText('AU$1,451.34')).toBeInTheDocument()
    expect(totals.getByText('AU$728.66')).toBeInTheDocument()
  })

  it('tells the user when the invoice does not exist', async () => {
    vi.mocked(fetchInvoice).mockRejectedValue(new ApiError(404, ['Invoice not found']))
    renderApp('/invoices/00000000-0000-4000-8000-000000000000')

    expect(await screen.findByText('Invoice not found')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /back to invoices/i })).toHaveAttribute('href', '/invoices')
  })
})
