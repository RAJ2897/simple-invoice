import { zodResolver } from '@hookform/resolvers/zod'
import {
  Alert,
  Anchor,
  Button,
  Group,
  List,
  NumberInput,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
} from '@mantine/core'
import { DatePickerInput } from '@mantine/dates'
import { notifications } from '@mantine/notifications'
import { IconAlertCircle, IconArrowLeft, IconCalendar, IconCheck } from '@tabler/icons-react'
import { useState, type ReactNode } from 'react'
import { Controller, useForm, type FieldPath } from 'react-hook-form'
import { Link, useNavigate } from 'react-router'
import { ApiError } from '../api/client'
import {
  emptyInvoiceForm,
  invoiceFormSchema,
  toCreatePayload,
  type InvoiceFormInput,
  type InvoiceFormValues,
} from '../features/invoices/invoice-form'
import { useCreateInvoice } from '../features/invoices/queries'
import { CURRENCIES } from '../utils/currencies'
import { todayIso } from '../utils/format'

type FieldName = FieldPath<InvoiceFormInput>

/** Translates a backend property path ("customer.email", "items.0.rate") to a form field. */
const SERVER_FIELDS: Record<string, FieldName> = {
  invoiceNumber: 'invoiceNumber',
  invoiceReference: 'invoiceReference',
  invoiceDate: 'invoiceDate',
  dueDate: 'dueDate',
  currency: 'currency',
  description: 'description',
  'customer.fullname': 'customer.fullname',
  'customer.email': 'customer.email',
  'customer.mobileNumber': 'customer.mobileNumber',
  'customer.address': 'customer.address',
  'items.0.name': 'item.name',
  'items.0.quantity': 'item.quantity',
  'items.0.rate': 'item.rate',
  taxRate: 'taxRate',
  discount: 'discount',
}

const numberValue = (value: unknown) => (typeof value === 'number' || typeof value === 'string' ? value : '')

function Section({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <Paper withBorder p={{ base: 'md', sm: 'lg' }}>
      <Title order={2} fz="h5">
        {title}
      </Title>
      <Text size="sm" c="dimmed" mb="md">
        {description}
      </Text>
      {children}
    </Paper>
  )
}

export function CreateInvoicePage() {
  const navigate = useNavigate()
  const createInvoice = useCreateInvoice()
  const [serverErrors, setServerErrors] = useState<string[]>([])

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<InvoiceFormInput, unknown, InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: emptyInvoiceForm(todayIso()),
    mode: 'onTouched',
  })

  const onSubmit = handleSubmit(async (values) => {
    setServerErrors([])
    try {
      const invoice = await createInvoice.mutateAsync(toCreatePayload(values))
      notifications.show({
        color: 'teal',
        icon: <IconCheck size={18} />,
        title: 'Invoice created',
        message: `${invoice.invoiceNumber} was saved as a draft.`,
      })
      navigate('/invoices')
    } catch (error) {
      const apiError = ApiError.from(error)
      if (apiError.status === 409) {
        setError('invoiceNumber', { message: apiError.message }, { shouldFocus: true })
        return
      }
      const unmatched: string[] = []
      for (const message of apiError.messages) {
        const field = SERVER_FIELDS[message.split(' ')[0]]
        if (apiError.status === 400 && field) setError(field, { message })
        else unmatched.push(message)
      }
      setServerErrors(unmatched)
    }
  })

  return (
    <Stack gap="lg" maw={960}>
      <Anchor component={Link} to="/invoices" size="sm">
        <Group gap={4}>
          <IconArrowLeft size={14} /> Back to invoices
        </Group>
      </Anchor>

      <div>
        <Title order={1} fz={{ base: 'h2', sm: 'h1' }}>
          New invoice
        </Title>
        <Text c="dimmed" size="sm">
          New invoices are saved as Draft. Totals are calculated by the server when you save.
        </Text>
      </div>

      <form onSubmit={onSubmit} noValidate aria-label="Create invoice">
        <Stack gap="lg">
          {serverErrors.length > 0 && (
            <Alert color="red" variant="light" icon={<IconAlertCircle size={18} />} title="Could not create the invoice" role="alert">
              <List size="sm">
                {serverErrors.map((message) => (
                  <List.Item key={message}>{message}</List.Item>
                ))}
              </List>
            </Alert>
          )}

          <Section title="Invoice details" description="Numbering, dates and currency.">
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
              <TextInput
                label="Invoice number"
                placeholder="INV-2026-0001"
                withAsterisk
                error={errors.invoiceNumber?.message}
                {...register('invoiceNumber')}
              />
              <TextInput
                label="Reference"
                placeholder="PO or external reference"
                error={errors.invoiceReference?.message}
                {...register('invoiceReference')}
              />
              <Controller
                control={control}
                name="invoiceDate"
                render={({ field }) => (
                  <DatePickerInput
                    label="Invoice date"
                    placeholder="Pick a date"
                    withAsterisk
                    valueFormat="D MMM YYYY"
                    leftSection={<IconCalendar size={16} />}
                    value={field.value || null}
                    onChange={(value) => field.onChange(value ?? '')}
                    onBlur={field.onBlur}
                    error={errors.invoiceDate?.message}
                  />
                )}
              />
              <Controller
                control={control}
                name="dueDate"
                render={({ field }) => (
                  <DatePickerInput
                    label="Due date"
                    placeholder="Pick a date"
                    withAsterisk
                    valueFormat="D MMM YYYY"
                    leftSection={<IconCalendar size={16} />}
                    value={field.value || null}
                    onChange={(value) => field.onChange(value ?? '')}
                    onBlur={field.onBlur}
                    error={errors.dueDate?.message}
                  />
                )}
              />
              <Controller
                control={control}
                name="currency"
                render={({ field }) => (
                  <Select
                    label="Currency"
                    withAsterisk
                    searchable
                    allowDeselect={false}
                    data={CURRENCIES.map((c) => ({ value: c.code, label: `${c.code} (${c.symbol}) – ${c.label}` }))}
                    value={field.value ?? null}
                    onChange={(value) => field.onChange(value ?? '')}
                    onBlur={field.onBlur}
                    error={errors.currency?.message}
                  />
                )}
              />
              <Textarea
                label="Description"
                placeholder="Optional note shown on the invoice"
                autosize
                minRows={1}
                maxRows={4}
                error={errors.description?.message}
                {...register('description')}
              />
            </SimpleGrid>
          </Section>

          <Section title="Customer" description="Who the invoice is addressed to.">
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
              <TextInput
                label="Customer name"
                placeholder="Jane Citizen"
                withAsterisk
                autoComplete="off"
                error={errors.customer?.fullname?.message}
                {...register('customer.fullname')}
              />
              <TextInput
                label="Customer email"
                placeholder="jane@company.com"
                type="email"
                withAsterisk
                autoComplete="off"
                error={errors.customer?.email?.message}
                {...register('customer.email')}
              />
              <TextInput
                label="Mobile number"
                placeholder="+61 400 000 000"
                type="tel"
                error={errors.customer?.mobileNumber?.message}
                {...register('customer.mobileNumber')}
              />
              <TextInput
                label="Address"
                placeholder="Street, city, country"
                error={errors.customer?.address?.message}
                {...register('customer.address')}
              />
            </SimpleGrid>
          </Section>

          <Section title="Line item" description="One item per invoice for now.">
            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
              <TextInput
                label="Item name"
                placeholder="Consulting services"
                withAsterisk
                error={errors.item?.name?.message}
                {...register('item.name')}
              />
              <Controller
                control={control}
                name="item.quantity"
                render={({ field }) => (
                  <NumberInput
                    label="Quantity"
                    withAsterisk
                    min={1}
                    allowDecimal={false}
                    allowNegative={false}
                    thousandSeparator=","
                    value={numberValue(field.value)}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    error={errors.item?.quantity?.message}
                  />
                )}
              />
              <Controller
                control={control}
                name="item.rate"
                render={({ field }) => (
                  <NumberInput
                    label="Rate"
                    placeholder="0.00"
                    withAsterisk
                    min={0}
                    decimalScale={2}
                    allowNegative={false}
                    thousandSeparator=","
                    value={numberValue(field.value)}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    error={errors.item?.rate?.message}
                  />
                )}
              />
            </SimpleGrid>
          </Section>

          <Section title="Tax & discount" description="Tax is a percentage of the subtotal; discount is a flat amount.">
            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
              <Controller
                control={control}
                name="taxRate"
                render={({ field }) => (
                  <NumberInput
                    label="Tax (%)"
                    min={0}
                    decimalScale={2}
                    allowNegative={false}
                    suffix="%"
                    value={numberValue(field.value)}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    error={errors.taxRate?.message}
                  />
                )}
              />
              <Controller
                control={control}
                name="discount"
                render={({ field }) => (
                  <NumberInput
                    label="Discount"
                    min={0}
                    decimalScale={2}
                    allowNegative={false}
                    thousandSeparator=","
                    value={numberValue(field.value)}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    error={errors.discount?.message}
                  />
                )}
              />
            </SimpleGrid>
          </Section>

          <Group justify="flex-end" gap="sm">
            <Button variant="default" component={Link} to="/invoices">
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting}>
              Create invoice
            </Button>
          </Group>
        </Stack>
      </form>
    </Stack>
  )
}
