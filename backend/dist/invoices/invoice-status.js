export var PersistedInvoiceStatus;
(function (PersistedInvoiceStatus) {
    PersistedInvoiceStatus["Draft"] = "Draft";
    PersistedInvoiceStatus["Pending"] = "Pending";
    PersistedInvoiceStatus["Paid"] = "Paid";
})(PersistedInvoiceStatus || (PersistedInvoiceStatus = {}));
export var InvoiceStatus;
(function (InvoiceStatus) {
    InvoiceStatus["Draft"] = "Draft";
    InvoiceStatus["Pending"] = "Pending";
    InvoiceStatus["Paid"] = "Paid";
    InvoiceStatus["Overdue"] = "Overdue";
})(InvoiceStatus || (InvoiceStatus = {}));
export function deriveInvoiceStatus(status, dueDate, today) {
    if (status !== PersistedInvoiceStatus.Paid && dueDate < today) {
        return InvoiceStatus.Overdue;
    }
    return status;
}
//# sourceMappingURL=invoice-status.js.map