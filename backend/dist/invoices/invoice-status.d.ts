export declare enum PersistedInvoiceStatus {
    Draft = "Draft",
    Pending = "Pending",
    Paid = "Paid"
}
export declare enum InvoiceStatus {
    Draft = "Draft",
    Pending = "Pending",
    Paid = "Paid",
    Overdue = "Overdue"
}
export declare function deriveInvoiceStatus(status: PersistedInvoiceStatus, dueDate: string, today: string): InvoiceStatus;
