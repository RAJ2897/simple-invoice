import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ApiError } from '../api/client'
import { createInvoice, fetchInvoices } from '../api/invoices'
import { detail, page } from '../test/fixtures'
import { renderApp, signIn } from '../test/render'

vi.mock('../api/invoices')

async function fillRequiredFields(user: ReturnType<typeof userEvent.setup>) {
  await user.type(await screen.findByLabelText(/Invoice number/), 'INV-NEW-1')
  await user.type(screen.getByLabelText(/Customer name/), 'Jane Citizen')
  await user.type(screen.getByLabelText(/Customer email/), 'jane@company.com')
  await user.type(screen.getByLabelText(/Item name/), 'Consulting')
  await user.clear(screen.getByLabelText(/Quantity/))
  await user.type(screen.getByLabelText(/Quantity/), '3')
  await user.type(screen.getByLabelText(/Rate/), '150.5')

  // Today is pinned to 3 Jun 2026; pick 20 Jun 2026 as the due date
  await user.click(screen.getByRole('button', { name: /Due date/ }))
  await user.click(await screen.findByRole('button', { name: '20 June 2026' }))
}

describe('CreateInvoicePage', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-06-03T10:00:00'))
    signIn()
    vi.mocked(fetchInvoices).mockResolvedValue(page([]))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('validates required fields on the client', async () => {
    const user = userEvent.setup()
    renderApp('/invoices/new')

    await user.click(await screen.findByRole('button', { name: 'Create invoice' }))

    expect(await screen.findByText('Invoice number is required')).toBeInTheDocument()
    expect(screen.getByText('Customer name is required')).toBeInTheDocument()
    expect(screen.getByText('Customer email is required')).toBeInTheDocument()
    expect(screen.getByText('Due date is required')).toBeInTheDocument()
    expect(screen.getByText('Item name is required')).toBeInTheDocument()
    expect(screen.getByText('Rate is required')).toBeInTheDocument()
    expect(createInvoice).not.toHaveBeenCalled()
  })

  it('creates a draft invoice, notifies and returns to the list', async () => {
    vi.mocked(createInvoice).mockResolvedValue(detail({ invoiceNumber: 'INV-NEW-1', status: 'Draft' }))
    const user = userEvent.setup()
    const { router } = renderApp('/invoices/new')

    await fillRequiredFields(user)
    await user.click(screen.getByRole('button', { name: 'Create invoice' }))

    await waitFor(() => expect(router.state.location.pathname).toBe('/invoices'))
    expect(await screen.findByText('INV-NEW-1 was saved as a draft.')).toBeInTheDocument()
    expect(createInvoice).toHaveBeenCalledWith({
      invoiceNumber: 'INV-NEW-1',
      invoiceReference: undefined,
      invoiceDate: '2026-06-03',
      dueDate: '2026-06-20',
      currency: 'AUD',
      description: undefined,
      customer: { fullname: 'Jane Citizen', email: 'jane@company.com', mobileNumber: undefined, address: undefined },
      items: [{ name: 'Consulting', quantity: 3, rate: 150.5 }],
      taxRate: 10,
      discount: 0,
    })
  })

  it('shows a duplicate invoice number next to the field', async () => {
    vi.mocked(createInvoice).mockRejectedValue(new ApiError(409, ['Invoice number "INV-NEW-1" already exists']))
    const user = userEvent.setup()
    const { router } = renderApp('/invoices/new')

    await fillRequiredFields(user)
    await user.click(screen.getByRole('button', { name: 'Create invoice' }))

    expect(await screen.findByText('Invoice number "INV-NEW-1" already exists')).toBeInTheDocument()
    expect(screen.getByLabelText(/Invoice number/)).toHaveAttribute('aria-invalid', 'true')
    expect(router.state.location.pathname).toBe('/invoices/new')
  })

  it('maps server validation messages onto the matching fields', async () => {
    vi.mocked(createInvoice).mockRejectedValue(
      new ApiError(400, ['discount cannot be greater than the subtotal plus tax', 'something unexpected']),
    )
    const user = userEvent.setup()
    renderApp('/invoices/new')

    await fillRequiredFields(user)
    await user.click(screen.getByRole('button', { name: 'Create invoice' }))

    expect(await screen.findByText('discount cannot be greater than the subtotal plus tax')).toBeInTheDocument()
    expect(screen.getByText('something unexpected').closest('[role="alert"]')).toHaveTextContent(
      'Could not create the invoice',
    )
  })
})
