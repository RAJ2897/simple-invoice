import { faker } from '@faker-js/faker';
import { PersistedInvoiceStatus } from '../../invoices/invoice-status.js';

export interface SeedInvoice {
  invoiceId?: string;
  invoiceNumber: string;
  invoiceReference: string | null;
  invoiceDate: string;
  dueDate: string;
  currency: string;
  description: string | null;
  status: PersistedInvoiceStatus;
  customer: {
    fullname: string;
    email: string;
    mobileNumber: string | null;
    address: string | null;
  };
  item: { name: string; quantity: number; rate: number };
  taxRate: number;
  discount: number;
  /** Fraction of the total that has been paid, 0..1 */
  paidRatio: number;
  createdAt: Date;
}

/** Same id as `createdBy` in the assessment's mock dataset. */
export const SEED_USER_ID = 'ad1e0902-1928-4345-b513-60c86c94fc91';

/**
 * Appendix A record. The mock lists it as "Overdue", but Overdue is derived,
 * so it is stored as Pending (its due date is in the past, so it still reads as Overdue).
 */
export const appendixInvoice: SeedInvoice = {
  invoiceId: '099ca7da-a290-40fa-93b9-1c43ae7bb887',
  invoiceNumber: 'IV1780488206995',
  invoiceReference: '#5721662',
  invoiceDate: '2026-06-03',
  dueDate: '2026-07-03',
  currency: 'AUD',
  description: 'Invoice is issued to Kanglee',
  status: PersistedInvoiceStatus.Pending,
  customer: {
    fullname: 'Paul',
    email: 'paul@101digital.io',
    mobileNumber: '947717364111',
    address: 'Singapore',
  },
  item: { name: 'Honda RC150', quantity: 2, rate: 1000 },
  taxRate: 10,
  discount: 20,
  paidRatio: 1451.34 / 2180,
  createdAt: new Date('2026-06-03T12:03:26.995Z'),
};

const PRODUCTS: Array<
  [name: string, minRate: number, maxRate: number, maxQty: number]
> = [
  ['Website redesign', 1500, 6000, 1],
  ['Monthly SEO retainer', 400, 1200, 3],
  ['Mobile app sprint (2 weeks)', 3000, 9000, 2],
  ['Cloud hosting - annual', 600, 2400, 2],
  ['UX audit', 800, 2500, 1],
  ['Brand identity package', 1200, 4000, 1],
  ['Laptop - Dell Latitude 7450', 1400, 2200, 6],
  ['Office chairs', 180, 450, 12],
  ['Consulting hours', 90, 180, 40],
  ['Security penetration test', 2500, 7000, 1],
  ['Data migration services', 1000, 3500, 2],
  ['Honda RC150', 900, 1100, 3],
  ['Printer toner cartridges', 45, 120, 20],
  ['Support plan - premium', 250, 900, 4],
];

const CURRENCIES = ['AUD', 'AUD', 'AUD', 'USD', 'USD', 'GBP', 'SGD', 'EUR'];
const TAX_RATES = [10, 10, 10, 0, 5, 7, 15, 20];
const PAYMENT_TERMS_DAYS = [7, 14, 14, 30, 30, 30, 45, 60];

function addDays(isoDate: string, days: number): string {
  const date = new Date(`${isoDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/**
 * Generates `count` invoices. The random seed is fixed so invoice numbers and
 * customers are the same on every run; dates are spread around `today` so
 * there is always a healthy mix of upcoming and overdue invoices.
 */
export function generateInvoices(count: number, today: string): SeedInvoice[] {
  faker.seed(20260603);

  const customers = Array.from({ length: 14 }, () => {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const isCompany = faker.datatype.boolean(0.3);
    return {
      fullname: isCompany ? faker.company.name() : `${firstName} ${lastName}`,
      email: faker.internet
        .email({ firstName, lastName, provider: 'example.com' })
        .toLowerCase(),
      mobileNumber: faker.datatype.boolean(0.8)
        ? faker.phone.number({ style: 'international' })
        : null,
      address: faker.datatype.boolean(0.85)
        ? `${faker.location.streetAddress()}, ${faker.location.city()}, ${faker.location.country()}`
        : null,
    };
  });

  return Array.from({ length: count }, (_, index) => {
    const status = faker.helpers.weightedArrayElement([
      { weight: 3, value: PersistedInvoiceStatus.Draft },
      { weight: 4, value: PersistedInvoiceStatus.Pending },
      { weight: 4, value: PersistedInvoiceStatus.Paid },
    ]);
    // Most unpaid invoices are recent (still within terms); roughly a third are old enough to be overdue.
    const isRecent =
      status !== PersistedInvoiceStatus.Paid && faker.datatype.boolean(0.65);
    const daysAgo = isRecent
      ? faker.number.int({ min: -10, max: 12 })
      : faker.number.int({ min: 20, max: 240 });
    const invoiceDate = addDays(today, -daysAgo);
    const dueDate = addDays(
      invoiceDate,
      isRecent
        ? faker.helpers.arrayElement([14, 30, 30, 45, 60])
        : faker.helpers.arrayElement(PAYMENT_TERMS_DAYS),
    );
    const [name, minRate, maxRate, maxQty] =
      faker.helpers.arrayElement(PRODUCTS);

    let paidRatio = 0;
    if (status === PersistedInvoiceStatus.Paid) paidRatio = 1;
    if (
      status === PersistedInvoiceStatus.Pending &&
      faker.datatype.boolean(0.4)
    ) {
      paidRatio = faker.number.float({ min: 0.1, max: 0.8, fractionDigits: 2 });
    }

    return {
      invoiceNumber: `INV-2026-${String(index + 1).padStart(4, '0')}`,
      invoiceReference: faker.datatype.boolean(0.5)
        ? `PO-${faker.string.numeric(6)}`
        : null,
      invoiceDate,
      dueDate,
      currency: faker.helpers.arrayElement(CURRENCIES),
      description: faker.datatype.boolean(0.6)
        ? faker.commerce.productDescription()
        : null,
      status,
      customer: faker.helpers.arrayElement(customers),
      item: {
        name,
        quantity: faker.number.int({ min: 1, max: maxQty }),
        rate: faker.number.float({
          min: minRate,
          max: maxRate,
          fractionDigits: 2,
        }),
      },
      taxRate: faker.helpers.arrayElement(TAX_RATES),
      discount: faker.datatype.boolean(0.3)
        ? faker.helpers.arrayElement([10, 25, 50, 100, 150])
        : 0,
      paidRatio,
      createdAt: new Date(
        `${invoiceDate}T${String(faker.number.int({ min: 8, max: 18 })).padStart(2, '0')}:15:00Z`,
      ),
    };
  });
}
