import { invoiceFormSchema, toCreatePayload } from './invoice-form'

const valid = {
  invoiceNumber: 'INV-1',
  invoiceReference: '',
  invoiceDate: '2026-06-03',
  dueDate: '2026-07-03',
  currency: 'AUD',
  description: '',
  customer: { fullname: 'Paul', email: 'paul@101digital.io', mobileNumber: '', address: '' },
  item: { name: 'Honda RC150', quantity: 2, rate: 1000 },
  taxRate: 10,
  discount: 20,
}

const errorsFor = (input: unknown) => {
  const result = invoiceFormSchema.safeParse(input)
  return result.success ? {} : Object.fromEntries(result.error.issues.map((i) => [i.path.join('.'), i.message]))
}

describe('invoiceFormSchema', () => {
  it('accepts a complete invoice', () => {
    expect(errorsFor(valid)).toEqual({})
  })

  it('accepts a due date equal to the invoice date', () => {
    expect(errorsFor({ ...valid, dueDate: valid.invoiceDate })).toEqual({})
  })

  it('rejects a due date before the invoice date', () => {
    expect(errorsFor({ ...valid, dueDate: '2026-06-02' })).toEqual({
      dueDate: 'Due date must be on or after the invoice date',
    })
  })

  it('still checks the dates when other fields are invalid', () => {
    expect(errorsFor({ ...valid, invoiceNumber: '', dueDate: '2026-06-02' })).toMatchObject({
      invoiceNumber: 'Invoice number is required',
      dueDate: 'Due date must be on or after the invoice date',
    })
  })

  it.each([
    [{ quantity: 0 }, 'item.quantity', 'Quantity must be greater than 0'],
    [{ quantity: 1.5 }, 'item.quantity', 'Quantity must be a whole number'],
    [{ rate: 0 }, 'item.rate', 'Rate must be greater than 0'],
    [{ rate: 1.005 }, 'item.rate', 'Rate can have at most 2 decimals'],
  ])('rejects item %o', (item, path, message) => {
    expect(errorsFor({ ...valid, item: { ...valid.item, ...item } })).toEqual({ [path]: message })
  })

  it('rejects a bad email and negative tax or discount', () => {
    expect(
      errorsFor({ ...valid, customer: { ...valid.customer, email: 'nope' }, taxRate: -1, discount: -5 }),
    ).toEqual({
      'customer.email': 'Enter a valid email address',
      taxRate: 'Tax cannot be negative',
      discount: 'Discount cannot be negative',
    })
  })

  it('parses the raw strings number inputs hand back while typing', () => {
    const parsed = invoiceFormSchema.parse({ ...valid, item: { ...valid.item, rate: '150.' }, discount: '' })
    expect(parsed.item.rate).toBe(150)
    expect(parsed.discount).toBe(0)
    expect(errorsFor({ ...valid, item: { ...valid.item, rate: '' } })).toEqual({ 'item.rate': 'Rate is required' })
  })

  it('accepts rates such as 1.1 despite floating point noise', () => {
    expect(errorsFor({ ...valid, item: { ...valid.item, rate: 1.1 } })).toEqual({})
  })
})

describe('toCreatePayload', () => {
  it('wraps the single item and drops blank optional fields', () => {
    const payload = toCreatePayload(invoiceFormSchema.parse({ ...valid, customer: { ...valid.customer, address: '  ' } }))
    expect(payload.items).toEqual([{ name: 'Honda RC150', quantity: 2, rate: 1000 }])
    expect(payload.invoiceReference).toBeUndefined()
    expect(payload.customer.address).toBeUndefined()
    expect(payload.customer.mobileNumber).toBeUndefined()
  })
})
