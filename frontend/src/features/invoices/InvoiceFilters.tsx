import { Button, CloseButton, Group, SegmentedControl, Select, Stack, TextInput } from '@mantine/core'
import { DatePickerInput, type DatesRangeValue } from '@mantine/dates'
import { useDebouncedCallback, useMediaQuery } from '@mantine/hooks'
import { IconCalendar, IconFilterOff, IconSearch } from '@tabler/icons-react'
import { useState } from 'react'
import type { InvoiceListParams, InvoiceStatus, SortField, SortOrder } from '../../types/api'

const SORT_OPTIONS = [
  { value: 'invoiceDate:DESC', label: 'Newest first' },
  { value: 'invoiceDate:ASC', label: 'Oldest first' },
  { value: 'dueDate:ASC', label: 'Due date (soonest)' },
  { value: 'dueDate:DESC', label: 'Due date (latest)' },
  { value: 'totalAmount:DESC', label: 'Amount (high to low)' },
  { value: 'totalAmount:ASC', label: 'Amount (low to high)' },
]

const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'Draft', label: 'Draft' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Paid', label: 'Paid' },
  { value: 'Overdue', label: 'Overdue' },
]

interface Props {
  params: InvoiceListParams
  hasFilters: boolean
  onChange: (changes: Partial<InvoiceListParams>) => void
  onReset: () => void
}

export function InvoiceFilters({ params, hasFilters, onChange, onReset }: Props) {
  const isMobile = useMediaQuery('(max-width: 48em)')
  const [keyword, setKeyword] = useState(params.keyword ?? '')
  const [syncedKeyword, setSyncedKeyword] = useState(params.keyword)

  // Keep the box in sync when the URL changes from elsewhere (back button, "clear filters")
  if (params.keyword !== syncedKeyword) {
    setSyncedKeyword(params.keyword)
    if ((params.keyword ?? '') !== keyword.trim()) setKeyword(params.keyword ?? '')
  }

  const commitKeyword = useDebouncedCallback((value: string) => {
    onChange({ keyword: value.trim() || undefined })
  }, 350)

  const status = params.status ?? 'all'
  const onStatus = (value: string | null) =>
    onChange({ status: !value || value === 'all' ? undefined : (value as InvoiceStatus) })

  const dateRange: DatesRangeValue<string> = [params.fromDate ?? null, params.toDate ?? null]

  return (
    <Stack gap="sm">
      <Group gap="sm" align="flex-end" wrap="wrap">
        <TextInput
          aria-label="Search invoices"
          placeholder="Search by invoice # or customer"
          leftSection={<IconSearch size={16} />}
          value={keyword}
          onChange={(event) => {
            setKeyword(event.currentTarget.value)
            commitKeyword(event.currentTarget.value)
          }}
          rightSection={
            keyword ? (
              <CloseButton
                size="sm"
                aria-label="Clear search"
                onClick={() => {
                  setKeyword('')
                  onChange({ keyword: undefined })
                }}
              />
            ) : null
          }
          style={{ flex: '1 1 260px' }}
        />

        <DatePickerInput
          type="range"
          aria-label="Invoice date range"
          placeholder="Invoice date range"
          leftSection={<IconCalendar size={16} />}
          valueFormat="D MMM YYYY"
          clearable
          allowSingleDateInRange
          value={dateRange}
          onChange={([from, to]) => {
            // wait for the second click before filtering, unless the range is being cleared
            if (from && !to) return
            onChange({ fromDate: from ?? undefined, toDate: to ?? undefined })
          }}
          style={{ flex: '1 1 220px' }}
          maw={{ sm: 280 }}
        />

        <Select
          aria-label="Sort invoices"
          data={SORT_OPTIONS}
          value={`${params.sortBy}:${params.ordering}`}
          allowDeselect={false}
          onChange={(value) => {
            if (!value) return
            const [sortBy, ordering] = value.split(':') as [SortField, SortOrder]
            onChange({ sortBy, ordering })
          }}
          style={{ flex: '1 1 190px' }}
          maw={{ sm: 220 }}
        />
      </Group>

      <Group justify="space-between" gap="sm">
        {isMobile ? (
          <Select
            aria-label="Filter by status"
            data={STATUS_OPTIONS.map((o) => ({ ...o, label: o.value === 'all' ? 'All statuses' : o.label }))}
            value={status}
            onChange={onStatus}
            allowDeselect={false}
            style={{ flex: 1 }}
          />
        ) : (
          <SegmentedControl aria-label="Filter by status" data={STATUS_OPTIONS} value={status} onChange={onStatus} />
        )}

        {hasFilters && (
          <Button variant="subtle" color="gray" leftSection={<IconFilterOff size={16} />} onClick={onReset}>
            Clear filters
          </Button>
        )}
      </Group>
    </Stack>
  )
}
