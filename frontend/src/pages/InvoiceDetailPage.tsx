import {
  Alert,
  Anchor,
  Button,
  Divider,
  Group,
  Paper,
  SimpleGrid,
  Skeleton,
  Stack,
  Table,
  Text,
  Title,
} from '@mantine/core'
import { IconAlertCircle, IconArrowLeft, IconPrinter } from '@tabler/icons-react'
import type { ReactNode } from 'react'
import { Link, useParams } from 'react-router'
import { ApiError } from '../api/client'
import { StatusBadge } from '../components/StatusBadge'
import { useInvoice } from '../features/invoices/queries'
import type { InvoiceDetail } from '../types/api'
import { dueDateHint, formatDate, formatMoney } from '../utils/format'

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <Text size="xs" c="dimmed" tt="uppercase" fw={600} lts={0.4}>
        {label}
      </Text>
      <Text size="sm" mt={2} component="div">
        {children || '—'}
      </Text>
    </div>
  )
}

function TotalRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <Group justify="space-between" wrap="nowrap">
      <Text size="sm" c={strong ? undefined : 'dimmed'} fw={strong ? 700 : 400}>
        {label}
      </Text>
      <Text size={strong ? 'md' : 'sm'} fw={strong ? 700 : 500} className="tabular-nums">
        {value}
      </Text>
    </Group>
  )
}

const BackLink = () => (
  <Anchor component={Link} to="/invoices" size="sm" className="no-print">
    <Group gap={4}>
      <IconArrowLeft size={14} /> Back to invoices
    </Group>
  </Anchor>
)

export function InvoiceDetailPage() {
  const { id = '' } = useParams()
  const { data: invoice, isPending, isError, error, refetch } = useInvoice(id)

  if (isPending) {
    return (
      <Stack gap="lg" aria-busy="true" aria-label="Loading invoice">
        <Skeleton height={20} width={140} />
        <Skeleton height={40} width="50%" />
        <Skeleton height={180} />
        <Skeleton height={220} />
      </Stack>
    )
  }

  if (isError) {
    const apiError = ApiError.from(error)
    const notFound = apiError.status === 404
    return (
      <Stack gap="lg">
        <BackLink />
        <Alert
          color={notFound ? 'gray' : 'red'}
          variant="light"
          icon={<IconAlertCircle size={18} />}
          title={notFound ? 'Invoice not found' : 'Could not load invoice'}
        >
          <Text size="sm" mb={notFound ? 0 : 'sm'}>
            {notFound ? 'It may have been removed, or the link is incorrect.' : apiError.message}
          </Text>
          {!notFound && (
            <Button size="xs" variant="light" color="red" onClick={() => refetch()}>
              Try again
            </Button>
          )}
        </Alert>
      </Stack>
    )
  }

  return <InvoiceView invoice={invoice} />
}

function InvoiceView({ invoice }: { invoice: InvoiceDetail }) {
  const money = (amount: number) => formatMoney(amount, invoice.currencySymbol)
  const hint = dueDateHint(invoice.dueDate, invoice.status === 'Paid')

  return (
    <Stack gap="lg">
      <BackLink />

      <Group justify="space-between" align="flex-start">
        <div>
          <Group gap="sm">
            <Title order={1} fz={{ base: 'h2', sm: 'h1' }}>
              {invoice.invoiceNumber}
            </Title>
            <StatusBadge status={invoice.status} size="lg" />
          </Group>
          <Text c="dimmed" size="sm" mt={4}>
            Issued to {invoice.customer.fullname} on {formatDate(invoice.invoiceDate)}
          </Text>
        </div>
        <Group gap="lg" align="flex-start">
          <div style={{ textAlign: 'right' }}>
            <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
              Balance due
            </Text>
            <Text fz={28} fw={700} lh={1.2} className="tabular-nums">
              {money(invoice.balanceAmount)}
            </Text>
          </div>
          <Button
            variant="default"
            leftSection={<IconPrinter size={16} />}
            onClick={() => window.print()}
            className="no-print"
            visibleFrom="sm"
          >
            Print
          </Button>
        </Group>
      </Group>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
        <Paper withBorder p="lg">
          <Title order={2} fz="h5" mb="md">
            Invoice information
          </Title>
          <SimpleGrid cols={2} spacing="md" verticalSpacing="md">
            <Field label="Invoice number">{invoice.invoiceNumber}</Field>
            <Field label="Reference">{invoice.invoiceReference}</Field>
            <Field label="Invoice date">{formatDate(invoice.invoiceDate)}</Field>
            <Field label="Due date">
              {formatDate(invoice.dueDate)}
              {hint && (
                <Text size="xs" c={invoice.status === 'Overdue' ? 'red.7' : 'dimmed'}>
                  {hint}
                </Text>
              )}
            </Field>
            <Field label="Currency">
              {invoice.currency} ({invoice.currencySymbol})
            </Field>
            <Field label="Status">
              <StatusBadge status={invoice.status} size="sm" />
            </Field>
          </SimpleGrid>
          {invoice.description && (
            <>
              <Divider my="md" />
              <Field label="Description">{invoice.description}</Field>
            </>
          )}
        </Paper>

        <Paper withBorder p="lg">
          <Title order={2} fz="h5" mb="md">
            Customer
          </Title>
          <SimpleGrid cols={{ base: 1, xs: 2 }} spacing="md" verticalSpacing="md">
            <Field label="Name">{invoice.customer.fullname}</Field>
            <Field label="Email">
              <Anchor href={`mailto:${invoice.customer.email}`} size="sm">
                {invoice.customer.email}
              </Anchor>
            </Field>
            <Field label="Mobile">{invoice.customer.mobileNumber}</Field>
            <Field label="Address">{invoice.customer.address}</Field>
          </SimpleGrid>
        </Paper>
      </SimpleGrid>

      <Paper withBorder p="lg">
        <Title order={2} fz="h5" mb="md">
          Line items
        </Title>
        <Table.ScrollContainer minWidth={480}>
          <Table verticalSpacing="sm">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Item</Table.Th>
                <Table.Th ta="right">Qty</Table.Th>
                <Table.Th ta="right">Rate</Table.Th>
                <Table.Th ta="right">Amount</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {invoice.items.map((item) => (
                <Table.Tr key={item.id}>
                  <Table.Td>{item.name}</Table.Td>
                  <Table.Td ta="right" className="tabular-nums">
                    {item.quantity}
                  </Table.Td>
                  <Table.Td ta="right" className="tabular-nums">
                    {money(item.rate)}
                  </Table.Td>
                  <Table.Td ta="right" className="tabular-nums">
                    {money(item.amount)}
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>

        <Group justify="flex-end" mt="md">
          <Stack gap={8} w={{ base: '100%', sm: 320 }} aria-label="Invoice totals">
            <TotalRow label="Subtotal" value={money(invoice.invoiceSubTotal)} />
            <TotalRow label={`Tax (${invoice.taxRate}%)`} value={money(invoice.totalTax)} />
            <TotalRow label="Discount" value={`-${money(invoice.totalDiscount)}`} />
            <Divider />
            <TotalRow label="Total" value={money(invoice.totalAmount)} strong />
            <TotalRow label="Paid" value={money(invoice.totalPaid)} />
            <Divider />
            <TotalRow label="Balance due" value={money(invoice.balanceAmount)} strong />
          </Stack>
        </Group>
      </Paper>
    </Stack>
  )
}
