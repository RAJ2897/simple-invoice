import { Button, Center, Stack, Text, Title } from '@mantine/core'
import { Link } from 'react-router'

export function NotFoundPage() {
  return (
    <Center py={80}>
      <Stack align="center" gap="xs">
        <Title order={1}>Page not found</Title>
        <Text c="dimmed">The page you are looking for doesn't exist.</Text>
        <Button component={Link} to="/invoices" mt="md">
          Go to invoices
        </Button>
      </Stack>
    </Center>
  )
}
