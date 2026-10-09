import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ApiError } from '../api/client'
import { login } from '../api/auth'
import { fetchInvoices } from '../api/invoices'
import { sessionStore } from '../auth/session-storage'
import { page } from '../test/fixtures'
import { renderApp, testUser } from '../test/render'

vi.mock('../api/auth')
vi.mock('../api/invoices')

describe('Authentication flow', () => {
  beforeEach(() => {
    vi.mocked(fetchInvoices).mockResolvedValue(page([]))
  })

  it('redirects anonymous visitors from a protected page to the login screen', async () => {
    const { router } = renderApp('/invoices')

    expect(await screen.findByRole('heading', { name: 'Welcome back' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/login')
    expect(fetchInvoices).not.toHaveBeenCalled()
  })

  it('validates the fields before calling the API', async () => {
    const user = userEvent.setup()
    renderApp('/login')

    await user.click(await screen.findByRole('button', { name: 'Sign in' }))
    expect(await screen.findByText('Email is required')).toBeInTheDocument()
    expect(screen.getByText('Password is required')).toBeInTheDocument()

    await user.type(screen.getByLabelText('Email'), 'not-an-email')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(await screen.findByText('Enter a valid email address')).toBeInTheDocument()
    expect(login).not.toHaveBeenCalled()
  })

  it('stores the token and lands on the invoice list after signing in', async () => {
    vi.mocked(login).mockResolvedValue({ accessToken: 'jwt', tokenType: 'Bearer', expiresIn: 3600, user: testUser })
    const user = userEvent.setup()
    const { router } = renderApp('/login')

    await user.type(await screen.findByLabelText('Email'), 'admin@simpleinvoice.dev')
    await user.type(screen.getByLabelText('Password'), 'secret')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByRole('heading', { name: 'Invoices' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/invoices')
    expect(login).toHaveBeenCalledWith('admin@simpleinvoice.dev', 'secret')
    expect(sessionStore.read()?.token).toBe('jwt')
  })

  it('shows the server message when the credentials are wrong', async () => {
    vi.mocked(login).mockRejectedValue(new ApiError(401, ['Invalid email or password']))
    const user = userEvent.setup()
    renderApp('/login')

    await user.type(await screen.findByLabelText('Email'), 'admin@simpleinvoice.dev')
    await user.type(screen.getByLabelText('Password'), 'wrong')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid email or password')
    expect(sessionStore.read()).toBeNull()
  })
})
