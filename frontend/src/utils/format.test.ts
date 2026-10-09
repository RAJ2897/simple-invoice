import { dueDateHint, formatDate, formatMoney } from './format'

describe('formatMoney', () => {
  it('uses the invoice currency symbol with two decimals and grouping', () => {
    expect(formatMoney(2180, 'AU$')).toBe('AU$2,180.00')
    expect(formatMoney(0.5, '£')).toBe('£0.50')
  })

  it('puts the sign in front of the symbol', () => {
    expect(formatMoney(-20, 'US$')).toBe('-US$20.00')
  })
})

describe('formatDate', () => {
  it('formats ISO dates for display', () => {
    expect(formatDate('2026-06-03')).toBe('3 Jun 2026')
  })
})

describe('dueDateHint', () => {
  const today = '2026-06-10'

  it.each([
    ['2026-06-10', 'Due today'],
    ['2026-06-11', 'Due tomorrow'],
    ['2026-06-15', 'Due in 5 days'],
    ['2026-06-09', '1 day overdue'],
    ['2026-05-31', '10 days overdue'],
  ])('describes %s', (dueDate, hint) => {
    expect(dueDateHint(dueDate, false, today)).toBe(hint)
  })

  it('stays quiet for paid invoices and far-off due dates', () => {
    expect(dueDateHint('2026-05-01', true, today)).toBeNull()
    expect(dueDateHint('2026-09-01', false, today)).toBeNull()
  })
})
