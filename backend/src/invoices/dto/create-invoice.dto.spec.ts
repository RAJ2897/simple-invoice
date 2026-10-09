import { plainToInstance } from 'class-transformer';
import { validate, type ValidationError } from 'class-validator';
import { CreateInvoiceDto } from './create-invoice.dto.js';

const validPayload = {
  invoiceNumber: 'INV-TEST-1',
  invoiceDate: '2026-10-01',
  dueDate: '2026-10-31',
  currency: 'AUD',
  customer: { fullname: 'Jane Doe', email: 'jane@example.com' },
  items: [{ name: 'Consulting', quantity: 2, rate: 150 }],
};

async function errorsFor(payload: object) {
  const dto = plainToInstance(CreateInvoiceDto, payload);
  return flatten(await validate(dto, { stopAtFirstError: true }));
}

function flatten(errors: ValidationError[], parent = ''): string[] {
  return errors.flatMap((error) => {
    const path = parent ? `${parent}.${error.property}` : error.property;
    return [
      ...Object.values(error.constraints ?? {}).map(
        (message) => `${path}: ${message}`,
      ),
      ...flatten(error.children ?? [], path),
    ];
  });
}

describe('CreateInvoiceDto validation', () => {
  it('accepts a valid payload', async () => {
    expect(await errorsFor(validPayload)).toEqual([]);
  });

  describe('due date', () => {
    it('rejects a due date before the invoice date', async () => {
      const errors = await errorsFor({
        ...validPayload,
        dueDate: '2026-09-30',
      });
      expect(errors).toEqual([
        'dueDate: dueDate must be on or after invoiceDate',
      ]);
    });

    it('accepts a due date on the same day as the invoice date', async () => {
      expect(
        await errorsFor({ ...validPayload, dueDate: validPayload.invoiceDate }),
      ).toEqual([]);
    });

    it('rejects impossible calendar dates', async () => {
      const errors = await errorsFor({
        ...validPayload,
        dueDate: '2026-02-30',
      });
      expect(errors).toEqual(['dueDate: dueDate must be a valid date']);
    });

    it('rejects date-times and other formats', async () => {
      const errors = await errorsFor({
        ...validPayload,
        invoiceDate: '2026-10-01T10:00:00Z',
      });
      expect(errors).toEqual([
        'invoiceDate: invoiceDate must be a date in YYYY-MM-DD format',
      ]);
    });
  });

  it('reports every missing required field', async () => {
    const errors = await errorsFor({});
    expect(errors).toEqual([
      'invoiceNumber: invoiceNumber is required',
      'invoiceDate: invoiceDate is required',
      'dueDate: dueDate is required',
      'currency: currency is required',
      'customer: customer is required',
      'items: items is required',
    ]);
  });

  it('validates the nested customer and item', async () => {
    const errors = await errorsFor({
      ...validPayload,
      customer: { fullname: '   ', email: 'not-an-email' },
      items: [{ name: 'Thing', quantity: 1.5, rate: 0 }],
    });
    expect(errors).toEqual([
      'customer.fullname: fullname is required',
      'customer.email: email must be a valid email address',
      'items.0.quantity: quantity must be a whole number',
      'items.0.rate: rate must be a positive number',
    ]);
  });

  it('allows only one line item', async () => {
    const errors = await errorsFor({
      ...validPayload,
      items: [validPayload.items[0], validPayload.items[0]],
    });
    expect(errors).toEqual(['items: items must contain exactly one line item']);
  });

  it('normalises currency to upper case and rejects unknown codes', async () => {
    const dto = plainToInstance(CreateInvoiceDto, {
      ...validPayload,
      currency: 'usd',
    });
    expect(dto.currency).toBe('USD');
    expect(await errorsFor({ ...validPayload, currency: 'ABC' })).toHaveLength(
      1,
    );
  });

  it('rejects negative tax and discount', async () => {
    const errors = await errorsFor({
      ...validPayload,
      taxRate: -1,
      discount: -5,
    });
    expect(errors).toEqual([
      'taxRate: taxRate must not be less than 0',
      'discount: discount must not be less than 0',
    ]);
  });
});
