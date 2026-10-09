import { AppShell, Avatar, Container, Group, Menu, Text, UnstyledButton } from '@mantine/core'
import { IconChevronDown, IconLogout } from '@tabler/icons-react'
import { Link, Outlet } from 'react-router'
import { useAuth } from '../auth/auth-context'
import { BrandMark } from '../components/BrandMark'

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function AppLayout() {
  const { user, logout } = useAuth()

  return (
    <AppShell header={{ height: 64 }} padding={0}>
      <AppShell.Header className="no-print">
        <Container size="xl" h="100%">
          <Group h="100%" justify="space-between" wrap="nowrap">
            <Link to="/invoices" style={{ textDecoration: 'none', color: 'inherit' }} aria-label="Go to invoices">
              <BrandMark />
            </Link>

            {user && (
              <Menu position="bottom-end" width={220} shadow="md">
                <Menu.Target>
                  <UnstyledButton aria-label="Account menu">
                    <Group gap={8} wrap="nowrap">
                      <Avatar color="brand" radius="xl" size={34}>
                        {initials(user.fullname)}
                      </Avatar>
                      <Text size="sm" fw={500} visibleFrom="sm">
                        {user.fullname}
                      </Text>
                      <IconChevronDown size={14} />
                    </Group>
                  </UnstyledButton>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Label>Signed in as</Menu.Label>
                  <Text size="sm" px="sm" pb="xs" truncate>
                    {user.email}
                  </Text>
                  <Menu.Divider />
                  <Menu.Item color="red" leftSection={<IconLogout size={16} />} onClick={() => logout()}>
                    Sign out
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            )}
          </Group>
        </Container>
      </AppShell.Header>

      <AppShell.Main bg="var(--mantine-color-gray-0)">
        <Container size="xl" py={{ base: 'md', sm: 'xl' }}>
          <Outlet />
        </Container>
      </AppShell.Main>
    </AppShell>
  )
}
