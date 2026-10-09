import { Card, Group, Stack, Table, Text, UnstyledButton } from '@mantine/core'
import type { KeyboardEvent } from 'react'
import { useNavigate } from 'react-router'
import { StatusBadge } from '../../components/StatusBadge'
import type { InvoiceSummary } from '../../types/api'
import { dueDateHint, formatDate, formatMoney } from '../../utils/format'

interface Props {
  invoices: InvoiceSummary[]
}

function DueDate({ invoice }: { invoice: InvoiceSummary }) {
  const hint = dueDateHint(invoice.dueDate, invoice.status === 'Paid')
  return (
    <div>
      <Text size="sm">{formatDate(invoice.dueDate)}</Text>
      {hint && (
        <Text size="xs" c={invoice.status === 'Overdue' ? 'red.7' : 'dimmed'}>
          {hint}
        </Text>
      )}
    </div>
  )
}

/** Desktop table; each row opens the invoice. */
export function InvoiceTable({ invoices }: Props) {
  const navigate = useNavigate()
  const open = (id: string) => navigate(`/invoices/${id}`)
  const onKeyDown = (event: KeyboardEvent, id: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      open(id)
    }
  }

  return (
    <Table.ScrollContainer minWidth={760}>
      <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Invoice #</Table.Th>
            <Table.Th>Customer</Table.Th>
            <Table.Th>Invoice date</Table.Th>
            <Table.Th>Due date</Table.Th>
            <Table.Th ta="right">Total</Table.Th>
            <Table.Th>Status</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {invoices.map((invoice) => (
            <Table.Tr
              key={invoice.invoiceId}
              className="invoice-row"
              tabIndex={0}
              role="link"
              aria-label={`Open invoice ${invoice.invoiceNumber}`}
              onClick={() => open(invoice.invoiceId)}
              onKeyDown={(event) => onKeyDown(event, invoice.invoiceId)}
            >
              <Table.Td>
                <Text size="sm" fw={600}>
                  {invoice.invoiceNumber}
                </Text>
                {invoice.invoiceReference && (
                  <Text size="xs" c="dimmed">
                    Ref {invoice.invoiceReference}
                  </Text>
                )}
              </Table.Td>
              <Table.Td>
                <Text size="sm">{invoice.customer.fullname}</Text>
                <Text size="xs" c="dimmed">
                  {invoice.customer.email}
                </Text>
              </Table.Td>
              <Table.Td>
                <Text size="sm">{formatDate(invoice.invoiceDate)}</Text>
              </Table.Td>
              <Table.Td>
                <DueDate invoice={invoice} />
              </Table.Td>
              <Table.Td ta="right" className="tabular-nums">
                <Text size="sm" fw={600}>
                  {formatMoney(invoice.totalAmount, invoice.currencySymbol)}
                </Text>
                {invoice.balanceAmount > 0 && invoice.balanceAmount !== invoice.totalAmount && (
                  <Text size="xs" c="dimmed">
                    {formatMoney(invoice.balanceAmount, invoice.currencySymbol)} due
                  </Text>
                )}
              </Table.Td>
              <Table.Td>
                <StatusBadge status={invoice.status} />
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  )
}

/** Stacked cards for small screens where a 6-column table doesn't fit. */
export function InvoiceCards({ invoices }: Props) {
  const navigate = useNavigate()

  return (
    <Stack gap="sm">
      {invoices.map((invoice) => (
        <UnstyledButton
          key={invoice.invoiceId}
          onClick={() => navigate(`/invoices/${invoice.invoiceId}`)}
          aria-label={`Open invoice ${invoice.invoiceNumber}`}
        >
          <Card withBorder padding="md">
            <Group justify="space-between" wrap="nowrap" align="flex-start">
              <div style={{ minWidth: 0 }}>
                <Text fw={600} size="sm">
                  {invoice.invoiceNumber}
                </Text>
                <Text size="sm" truncate>
                  {invoice.customer.fullname}
                </Text>
              </div>
              <StatusBadge status={invoice.status} size="sm" />
            </Group>
            <Group justify="space-between" mt="sm" align="flex-end" wrap="nowrap">
              <div>
                <Text size="xs" c="dimmed">
                  Issued {formatDate(invoice.invoiceDate)}
                </Text>
                <Text size="xs" c={invoice.status === 'Overdue' ? 'red.7' : 'dimmed'}>
                  Due {formatDate(invoice.dueDate)}
                </Text>
              </div>
              <Text fw={700} className="tabular-nums">
                {formatMoney(invoice.totalAmount, invoice.currencySymbol)}
              </Text>
            </Group>
          </Card>
        </UnstyledButton>
      ))}
    </Stack>
  )
}
