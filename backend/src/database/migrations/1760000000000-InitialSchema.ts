import type { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1760000000000 implements MigrationInterface {
  name = 'InitialSchema1760000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS pg_trgm`);

    await queryRunner.query(`
      CREATE TABLE users (
        id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        email         text NOT NULL,
        password_hash text NOT NULL,
        fullname      text NOT NULL,
        created_at    timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT uq_users_email UNIQUE (email),
        CONSTRAINT ck_users_email_lowercase CHECK (email = lower(email))
      )
    `);

    await queryRunner.query(
      `CREATE TYPE invoice_status AS ENUM ('Draft', 'Pending', 'Paid')`,
    );

    await queryRunner.query(`
      CREATE TABLE invoices (
        invoice_id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        invoice_number    text NOT NULL,
        invoice_reference text,
        invoice_date      date NOT NULL,
        due_date          date NOT NULL,
        currency          text NOT NULL,
        currency_symbol   text NOT NULL,
        description       text,
        status            invoice_status NOT NULL DEFAULT 'Draft',

        customer_fullname text NOT NULL,
        customer_email    text NOT NULL,
        customer_mobile   text,
        customer_address  text,

        tax_rate          numeric(5,2)  NOT NULL DEFAULT 10,
        invoice_sub_total numeric(12,2) NOT NULL,
        total_tax         numeric(12,2) NOT NULL,
        total_discount    numeric(12,2) NOT NULL DEFAULT 0,
        total_amount      numeric(12,2) NOT NULL,
        total_paid        numeric(12,2) NOT NULL DEFAULT 0,
        balance_amount    numeric(12,2) NOT NULL,

        created_at        timestamptz NOT NULL DEFAULT now(),
        created_by        uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,

        CONSTRAINT uq_invoices_invoice_number UNIQUE (invoice_number),
        CONSTRAINT ck_invoices_due_after_invoice CHECK (due_date >= invoice_date),
        CONSTRAINT ck_invoices_currency_iso CHECK (currency ~ '^[A-Z]{3}$'),
        CONSTRAINT ck_invoices_customer_name CHECK (length(trim(customer_fullname)) > 0),
        CONSTRAINT ck_invoices_tax_rate CHECK (tax_rate >= 0),
        CONSTRAINT ck_invoices_amounts CHECK (
          invoice_sub_total >= 0 AND total_tax >= 0 AND total_discount >= 0
          AND total_amount >= 0 AND total_paid >= 0
        )
      )
    `);

    await queryRunner.query(`
      CREATE TABLE invoice_items (
        id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        invoice_id uuid NOT NULL REFERENCES invoices(invoice_id) ON DELETE CASCADE,
        name       text NOT NULL,
        quantity   integer NOT NULL,
        rate       numeric(12,2) NOT NULL,
        CONSTRAINT ck_invoice_items_quantity CHECK (quantity > 0),
        CONSTRAINT ck_invoice_items_rate CHECK (rate > 0)
      )
    `);

    // Sorting / filtering columns used by GET /invoices
    await queryRunner.query(
      `CREATE INDEX ix_invoices_invoice_date ON invoices (invoice_date)`,
    );
    await queryRunner.query(
      `CREATE INDEX ix_invoices_due_date ON invoices (due_date)`,
    );
    await queryRunner.query(
      `CREATE INDEX ix_invoices_total_amount ON invoices (total_amount)`,
    );
    await queryRunner.query(
      `CREATE INDEX ix_invoices_status_due_date ON invoices (status, due_date)`,
    );
    // Foreign keys are not indexed automatically in Postgres
    await queryRunner.query(
      `CREATE INDEX ix_invoices_created_by ON invoices (created_by)`,
    );
    await queryRunner.query(
      `CREATE INDEX ix_invoice_items_invoice_id ON invoice_items (invoice_id)`,
    );
    // Trigram indexes make the ILIKE '%keyword%' search use an index
    await queryRunner.query(
      `CREATE INDEX ix_invoices_number_trgm ON invoices USING gin (invoice_number gin_trgm_ops)`,
    );
    await queryRunner.query(
      `CREATE INDEX ix_invoices_customer_trgm ON invoices USING gin (customer_fullname gin_trgm_ops)`,
    );

    // On Supabase the public schema is exposed through the Data API. Enabling RLS
    // without policies closes that door; the API connects as the table owner and
    // is not affected.
    for (const table of [
      'users',
      'invoices',
      'invoice_items',
      'typeorm_migrations',
    ]) {
      await queryRunner.query(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY`);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS invoice_items`);
    await queryRunner.query(`DROP TABLE IF EXISTS invoices`);
    await queryRunner.query(`DROP TYPE IF EXISTS invoice_status`);
    await queryRunner.query(`DROP TABLE IF EXISTS users`);
  }
}
