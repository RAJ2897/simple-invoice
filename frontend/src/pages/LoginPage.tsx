import { zodResolver } from '@hookform/resolvers/zod'
import { Alert, Box, Button, Center, Paper, PasswordInput, Stack, Text, TextInput, Title } from '@mantine/core'
import { IconAlertCircle, IconAt, IconLock } from '@tabler/icons-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Navigate, useLocation, useNavigate, type Location } from 'react-router'
import { z } from 'zod'
import { ApiError } from '../api/client'
import { useAuth } from '../auth/auth-context'
import { BrandMark } from '../components/BrandMark'

const loginSchema = z.object({
  email: z.string().trim().min(1, 'Email is required').pipe(z.email('Enter a valid email address')),
  password: z.string().min(1, 'Password is required'),
})

type LoginValues = z.infer<typeof loginSchema>

export function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [serverError, setServerError] = useState<string | null>(null)

  const redirectTo = (location.state as { from?: Location } | null)?.from?.pathname ?? '/invoices'

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />
  }

  const onSubmit = handleSubmit(async ({ email, password }) => {
    setServerError(null)
    try {
      await login(email, password)
      navigate(redirectTo, { replace: true })
    } catch (error) {
      const apiError = ApiError.from(error)
      setServerError(
        apiError.status === 429
          ? 'Too many attempts. Please wait a minute and try again.'
          : apiError.messages.join(' '),
      )
    }
  })

  return (
    <Center mih="100vh" p="md" bg="var(--mantine-color-gray-0)">
      <Box w="100%" maw={420}>
        <Center mb="xl">
          <BrandMark size="lg" />
        </Center>

        <Paper withBorder shadow="sm" p={{ base: 'lg', sm: 'xl' }}>
          <Title order={2} fz="h3">
            Welcome back
          </Title>
          <Text c="dimmed" size="sm" mt={4} mb="lg">
            Sign in to manage your invoices.
          </Text>

          <form onSubmit={onSubmit} noValidate>
            <Stack gap="md">
              {serverError && (
                <Alert color="red" variant="light" icon={<IconAlertCircle size={18} />} role="alert">
                  {serverError}
                </Alert>
              )}

              <TextInput
                label="Email"
                placeholder="you@company.com"
                type="email"
                autoComplete="email"
                autoFocus
                leftSection={<IconAt size={16} />}
                error={errors.email?.message}
                {...register('email')}
              />

              <PasswordInput
                label="Password"
                placeholder="Your password"
                autoComplete="current-password"
                leftSection={<IconLock size={16} />}
                error={errors.password?.message}
                {...register('password')}
              />

              <Button type="submit" fullWidth size="md" mt="xs" loading={isSubmitting}>
                Sign in
              </Button>
            </Stack>
          </form>
        </Paper>
      </Box>
    </Center>
  )
}
