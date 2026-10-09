import {
  deriveInvoiceStatus,
  InvoiceStatus,
  PersistedInvoiceStatus,
} from './invoice-status.js';

describe('deriveInvoiceStatus', () => {
  const today = '2026-10-09';

  it.each([
    [PersistedInvoiceStatus.Draft, '2026-10-08', InvoiceStatus.Overdue],
    [PersistedInvoiceStatus.Pending, '2026-01-01', InvoiceStatus.Overdue],
    [PersistedInvoiceStatus.Pending, '2026-10-09', InvoiceStatus.Pending],
    [PersistedInvoiceStatus.Draft, '2026-12-31', InvoiceStatus.Draft],
    [PersistedInvoiceStatus.Paid, '2026-01-01', InvoiceStatus.Paid],
    [PersistedInvoiceStatus.Paid, '2026-12-31', InvoiceStatus.Paid],
  ])('%s due %s → %s', (stored, dueDate, expected) => {
    expect(deriveInvoiceStatus(stored, dueDate, today)).toBe(expected);
  });

  it('treats an invoice due today as not yet overdue', () => {
    expect(
      deriveInvoiceStatus(PersistedInvoiceStatus.Pending, today, today),
    ).toBe(InvoiceStatus.Pending);
  });

  it('compares across month and year boundaries correctly', () => {
    expect(
      deriveInvoiceStatus(
        PersistedInvoiceStatus.Pending,
        '2025-12-31',
        '2026-01-01',
      ),
    ).toBe(InvoiceStatus.Overdue);
    expect(
      deriveInvoiceStatus(
        PersistedInvoiceStatus.Pending,
        '2026-02-01',
        '2026-01-31',
      ),
    ).toBe(InvoiceStatus.Pending);
  });
});
