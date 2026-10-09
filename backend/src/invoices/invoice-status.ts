/** Statuses that are actually written to the database. */
export enum PersistedInvoiceStatus {
  Draft = 'Draft',
  Pending = 'Pending',
  Paid = 'Paid',
}

/** Statuses the API can return. `Overdue` is derived when reading and never stored. */
export enum InvoiceStatus {
  Draft = 'Draft',
  Pending = 'Pending',
  Paid = 'Paid',
  Overdue = 'Overdue',
}

/**
 * An unpaid invoice whose due date is already behind us is reported as Overdue.
 * Dates are ISO `YYYY-MM-DD` strings, so a plain string comparison is enough.
 */
export function deriveInvoiceStatus(
  status: PersistedInvoiceStatus,
  dueDate: string,
  today: string,
): InvoiceStatus {
  if (status !== PersistedInvoiceStatus.Paid && dueDate < today) {
    return InvoiceStatus.Overdue;
  }
  return status as unknown as InvoiceStatus;
}
