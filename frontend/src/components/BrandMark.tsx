import { Group, Text, ThemeIcon } from '@mantine/core'
import { IconFileInvoice } from '@tabler/icons-react'

export function BrandMark({ size = 'md' }: { size?: 'md' | 'lg' }) {
  const large = size === 'lg'
  return (
    <Group gap={8} wrap="nowrap">
      <ThemeIcon size={large ? 40 : 32} radius="md" variant="filled">
        <IconFileInvoice size={large ? 24 : 19} stroke={1.8} />
      </ThemeIcon>
      <Text fw={700} fz={large ? 22 : 18} lh={1}>
        Simple<Text span c="brand.6" inherit>-Invoice</Text>
      </Text>
    </Group>
  )
}
