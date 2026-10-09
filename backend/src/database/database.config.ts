import pg from 'pg';
import type { DataSourceOptions } from 'typeorm';
import { User } from '../users/user.entity.js';
import { Invoice } from '../invoices/entities/invoice.entity.js';
import { InvoiceItem } from '../invoices/entities/invoice-item.entity.js';
import { InitialSchema1760000000000 } from './migrations/1760000000000-InitialSchema.js';

// Postgres DATE has no time zone. Keep it as a plain 'YYYY-MM-DD' string instead
// of letting node-postgres turn it into a JS Date at local midnight.
pg.types.setTypeParser(pg.types.builtins.DATE, (value) => value);

type Env = Record<string, string | undefined>;

export function buildDataSourceOptions(
  env: Env = process.env,
): DataSourceOptions {
  const ssl = env.DB_SSL === 'true';

  return {
    type: 'postgres',
    host: env.DB_HOST,
    port: Number(env.DB_PORT ?? 5432),
    username: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    ssl: ssl ? { rejectUnauthorized: false } : false,
    entities: [User, Invoice, InvoiceItem],
    migrations: [InitialSchema1760000000000],
    migrationsTableName: 'typeorm_migrations',
    synchronize: false,
    extra: { max: 10 },
  };
}
