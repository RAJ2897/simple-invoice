import { Badge } from '@mantine/core'
import type { InvoiceStatus } from '../types/api'

const COLORS: Record<InvoiceStatus, string> = {
  Draft: 'gray',
  Pending: 'blue',
  Paid: 'teal',
  Overdue: 'red',
}

export function StatusBadge({ status, size = 'md' }: { status: InvoiceStatus; size?: 'sm' | 'md' | 'lg' }) {
  return (
    <Badge color={COLORS[status]} variant="light" size={size} radius="sm">
      {status}
    </Badge>
  )
}
