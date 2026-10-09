import type { DefaultValues } from 'react-hook-form'
import { z } from 'zod'
import type { CreateInvoicePayload } from '../../types/api'
import { CURRENCIES } from '../../utils/currencies'

const required = (label: string) => z.string().trim().min(1, `${label} is required`)
const optionalText = (max: number) => z.string().trim().max(max, `Must be ${max} characters or fewer`)
// tolerance absorbs float noise such as 1.1 * 100 = 110.00000000000001
const twoDecimals = (value: number) => Math.abs(value * 100 - Math.round(value * 100)) < 1e-6

/**
 * Number inputs report half-typed values such as "150." as strings, so the form
 * keeps the raw value and it is only turned into a number here.
 */
const parseNumber =
  (blank?: number) =>
  (value: unknown): unknown =>
    value === '' || value === null || value === undefined ? blank : typeof value === 'string' ? Number(value) : value

const isoDate = (label: string) =>
  z
    .string({ error: `${label} is required` })
    .min(1, `${label} is required`)
    .regex(/^\d{4}-\d{2}-\d{2}$/, `${label} must be a valid date`)

/**
 * Mirrors the backend's CreateInvoiceDto so most mistakes are caught before a
 * round trip. The server stays the source of truth (and computes every total).
 */
export const invoiceFormSchema = z
  .object({
    invoiceNumber: required('Invoice number').max(50, 'Must be 50 characters or fewer'),
    invoiceReference: optionalText(100),
    invoiceDate: isoDate('Invoice date'),
    dueDate: isoDate('Due date'),
    currency: z.enum(CURRENCIES.map((c) => c.code) as [string, ...string[]], { error: 'Currency is required' }),
    description: optionalText(1000),
    customer: z.object({
      fullname: required('Customer name').max(150, 'Must be 150 characters or fewer'),
      email: required('Customer email').pipe(z.email('Enter a valid email address')),
      mobileNumber: optionalText(30),
      address: optionalText(500),
    }),
    item: z.object({
      name: required('Item name').max(200, 'Must be 200 characters or fewer'),
      quantity: z.preprocess(
        parseNumber(),
        z
          .number({ error: 'Quantity is required' })
          .int('Quantity must be a whole number')
          .positive('Quantity must be greater than 0'),
      ),
      rate: z.preprocess(
        parseNumber(),
        z
          .number({ error: 'Rate is required' })
          .positive('Rate must be greater than 0')
          .refine(twoDecimals, 'Rate can have at most 2 decimals'),
      ),
    }),
    taxRate: z.preprocess(
      parseNumber(),
      z
        .number({ error: 'Tax is required' })
        .min(0, 'Tax cannot be negative')
        .refine(twoDecimals, 'Tax can have at most 2 decimals'),
    ),
    discount: z.preprocess(
      parseNumber(0),
      z
        .number({ error: 'Discount must be a number' })
        .min(0, 'Discount cannot be negative')
        .refine(twoDecimals, 'Discount can have at most 2 decimals'),
    ),
  })
  .refine((v) => v.dueDate >= v.invoiceDate, {
    path: ['dueDate'],
    message: 'Due date must be on or after the invoice date',
    // still check the dates while other fields are invalid
    when: ({ value }) => {
      const v = value as { invoiceDate?: unknown; dueDate?: unknown }
      return typeof v.invoiceDate === 'string' && typeof v.dueDate === 'string' && !!v.invoiceDate && !!v.dueDate
    },
  })

export type InvoiceFormValues = z.infer<typeof invoiceFormSchema>

/** Form shape before validation: number inputs start empty. */
export type InvoiceFormInput = z.input<typeof invoiceFormSchema>

export function emptyInvoiceForm(today: string): DefaultValues<InvoiceFormInput> {
  return {
    invoiceNumber: '',
    invoiceReference: '',
    invoiceDate: today,
    dueDate: '',
    currency: 'AUD',
    description: '',
    customer: { fullname: '', email: '', mobileNumber: '', address: '' },
    item: { name: '', quantity: 1 },
    taxRate: 10,
    discount: 0,
  }
}

const blankToUndefined = (value: string) => (value === '' ? undefined : value)

export function toCreatePayload(values: InvoiceFormValues): CreateInvoicePayload {
  return {
    invoiceNumber: values.invoiceNumber,
    invoiceReference: blankToUndefined(values.invoiceReference),
    invoiceDate: values.invoiceDate,
    dueDate: values.dueDate,
    currency: values.currency,
    description: blankToUndefined(values.description),
    customer: {
      fullname: values.customer.fullname,
      email: values.customer.email,
      mobileNumber: blankToUndefined(values.customer.mobileNumber),
      address: blankToUndefined(values.customer.address),
    },
    items: [values.item],
    taxRate: values.taxRate,
    discount: values.discount,
  }
}
