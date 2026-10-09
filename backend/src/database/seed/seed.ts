import bcrypt from 'bcryptjs';
import { Decimal } from 'decimal.js';
import { In } from 'typeorm';
import { todayIsoDate } from '../../common/utils/date.js';
import { CURRENCY_SYMBOLS } from '../../invoices/currencies.js';
import { Invoice } from '../../invoices/entities/invoice.entity.js';
import { calculateInvoiceAmounts } from '../../invoices/invoice-calculator.js';
import { User } from '../../users/user.entity.js';
import {
  appendixInvoice,
  generateInvoices,
  SEED_USER_ID,
  type SeedInvoice,
} from './seed-data.js';

try {
  process.loadEnvFile();
} catch {
  // No .env file (e.g. inside Docker); variables come from the environment.
}

const GENERATED_INVOICES = 40;

async function seed() {
  const { AppDataSource } = await import('../data-source.js');
  const email = process.env.SEED_USER_EMAIL?.toLowerCase();
  const password = process.env.SEED_USER_PASSWORD;
  if (!email || !password) {
    throw new Error('SEED_USER_EMAIL and SEED_USER_PASSWORD must be set');
  }

  await AppDataSource.initialize();
  try {
    const migrations = await AppDataSource.runMigrations();
    migrations.forEach((m) => console.log(`  migration applied: ${m.name}`));

    await AppDataSource.transaction(async (manager) => {
      if (process.argv.includes('--reset')) {
        await manager.query('TRUNCATE invoice_items, invoices');
        console.log('  --reset: removed all existing invoices');
      }

      await manager
        .createQueryBuilder()
        .insert()
        .into(User)
        .values({
          id: SEED_USER_ID,
          email,
          passwordHash: await bcrypt.hash(password, 10),
          fullname: process.env.SEED_USER_FULLNAME ?? 'Admin User',
        })
        .orUpdate(['email', 'password_hash', 'fullname'], ['id'])
        .execute();
      console.log(`  reviewer account ready: ${email}`);

      const invoices = [
        appendixInvoice,
        ...generateInvoices(GENERATED_INVOICES, todayIsoDate()),
      ];
      const repo = manager.getRepository(Invoice);
      const existing = await repo.find({
        select: { invoiceNumber: true },
        where: {
          invoiceNumber: In(invoices.map((invoice) => invoice.invoiceNumber)),
        },
      });
      const taken = new Set(existing.map((invoice) => invoice.invoiceNumber));
      const toInsert = invoices.filter(
        (invoice) => !taken.has(invoice.invoiceNumber),
      );

      if (toInsert.length > 0) {
        await repo.save(
          toInsert.map((data) => repo.create(toEntity(data))),
          { chunk: 50 },
        );
      }
      console.log(
        `  invoices inserted: ${toInsert.length} (skipped ${taken.size} existing)`,
      );
    });
  } finally {
    await AppDataSource.destroy();
  }
}

function toEntity(data: SeedInvoice): Partial<Invoice> {
  const { totalAmount } = calculateInvoiceAmounts({
    items: [data.item],
    taxRate: data.taxRate,
    discount: data.discount,
  });
  const totalPaid = new Decimal(totalAmount)
    .times(data.paidRatio)
    .toDecimalPlaces(2)
    .toNumber();
  const amounts = calculateInvoiceAmounts({
    items: [data.item],
    taxRate: data.taxRate,
    discount: data.discount,
    totalPaid,
  });

  return {
    ...(data.invoiceId ? { invoiceId: data.invoiceId } : {}),
    invoiceNumber: data.invoiceNumber,
    invoiceReference: data.invoiceReference,
    invoiceDate: data.invoiceDate,
    dueDate: data.dueDate,
    currency: data.currency,
    currencySymbol: CURRENCY_SYMBOLS[data.currency] ?? data.currency,
    description: data.description,
    status: data.status,
    customerFullname: data.customer.fullname,
    customerEmail: data.customer.email,
    customerMobile: data.customer.mobileNumber,
    customerAddress: data.customer.address,
    taxRate: data.taxRate,
    ...amounts,
    createdAt: data.createdAt,
    createdBy: SEED_USER_ID,
    items: [{ ...data.item } as Invoice['items'][number]],
  };
}

console.log('Seeding database...');
seed()
  .then(() => console.log('Done.'))
  .catch((error: unknown) => {
    console.error('Seeding failed:', error);
    process.exitCode = 1;
  });
