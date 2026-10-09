import { Alert, Button, Center, Group, Pagination, Paper, Select, Skeleton, Stack, Text, Title } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { IconAlertCircle, IconFileOff, IconPlus } from '@tabler/icons-react'
import { useEffect } from 'react'
import { Link } from 'react-router'
import { ApiError } from '../api/client'
import { InvoiceFilters } from '../features/invoices/InvoiceFilters'
import { InvoiceCards, InvoiceTable } from '../features/invoices/InvoiceTable'
import { useInvoiceList } from '../features/invoices/queries'
import { PAGE_SIZES, useInvoiceListParams } from '../features/invoices/useInvoiceListParams'

export function InvoiceListPage() {
  const isMobile = useMediaQuery('(max-width: 48em)')
  const { params, update, reset, hasFilters } = useInvoiceListParams()
  const { data, isPending, isError, error, refetch, isPlaceholderData } = useInvoiceList(params)

  const total = data?.paging.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / params.pageSize))
  const first = total === 0 ? 0 : (params.page - 1) * params.pageSize + 1
  const last = Math.min(params.page * params.pageSize, total)

  // A bookmarked or hand-edited URL can point past the last page
  const pageOutOfRange = !isPlaceholderData && total > 0 && params.page > totalPages
  useEffect(() => {
    if (pageOutOfRange) update({ page: totalPages })
  }, [pageOutOfRange, totalPages, update])

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="flex-end">
        <div>
          <Title order={1} fz={{ base: 'h2', sm: 'h1' }}>
            Invoices
          </Title>
          <Text c="dimmed" size="sm">
            Search, filter and review every invoice in one place.
          </Text>
        </div>
        <Button component={Link} to="/invoices/new" leftSection={<IconPlus size={16} />}>
          New invoice
        </Button>
      </Group>

      <Paper withBorder p={{ base: 'sm', sm: 'md' }}>
        <InvoiceFilters params={params} hasFilters={hasFilters} onChange={update} onReset={reset} />
      </Paper>

      {isError ? (
        <Alert color="red" variant="light" icon={<IconAlertCircle size={18} />} title="Could not load invoices">
          <Text size="sm" mb="sm">
            {ApiError.from(error).message}
          </Text>
          <Button size="xs" variant="light" color="red" onClick={() => refetch()}>
            Try again
          </Button>
        </Alert>
      ) : isPending ? (
        <Paper withBorder p="md" aria-busy="true" aria-label="Loading invoices">
          <Stack gap="sm">
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} height={44} />
            ))}
          </Stack>
        </Paper>
      ) : data.data.length === 0 ? (
        <Paper withBorder p="xl">
          <Center>
            <Stack align="center" gap="xs">
              <IconFileOff size={40} stroke={1.4} color="var(--mantine-color-gray-5)" />
              <Text fw={600}>No invoices found</Text>
              <Text size="sm" c="dimmed" ta="center">
                {hasFilters ? 'Try a different search or clear the filters.' : 'Create your first invoice to get started.'}
              </Text>
              {hasFilters ? (
                <Button variant="light" onClick={reset}>
                  Clear filters
                </Button>
              ) : (
                <Button component={Link} to="/invoices/new" variant="light">
                  New invoice
                </Button>
              )}
            </Stack>
          </Center>
        </Paper>
      ) : (
        <Stack gap="md" style={{ opacity: isPlaceholderData ? 0.6 : 1, transition: 'opacity 150ms' }}>
          {isMobile ? (
            <InvoiceCards invoices={data.data} />
          ) : (
            <Paper withBorder style={{ overflow: 'hidden' }}>
              <InvoiceTable invoices={data.data} />
            </Paper>
          )}

          <Group justify="space-between" gap="sm">
            <Group gap="xs">
              <Text size="sm" c="dimmed">
                Showing {first}–{last} of {total}
              </Text>
              <Select
                aria-label="Rows per page"
                size="xs"
                w={110}
                data={PAGE_SIZES.map((size) => ({ value: String(size), label: `${size} / page` }))}
                value={String(params.pageSize)}
                allowDeselect={false}
                onChange={(value) => value && update({ pageSize: Number(value) })}
              />
            </Group>
            <Pagination
              total={totalPages}
              value={Math.min(params.page, totalPages)}
              onChange={(page) => update({ page })}
              size="sm"
              siblings={isMobile ? 0 : 1}
              getControlProps={(control) => ({ 'aria-label': `${control} page` })}
            />
          </Group>
        </Stack>
      )}
    </Stack>
  )
}
