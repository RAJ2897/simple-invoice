import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/app.setup.js';
import { todayIsoDate } from '../src/common/utils/date.js';

/**
 * Full HTTP round trip against the configured database (run `npm run seed` first).
 * Every invoice created here uses the E2E- prefix and is removed afterwards.
 */
describe('Invoices (e2e)', () => {
  let app: INestApplication<App>;
  let token: string;
  const invoiceNumber = `E2E-${Date.now()}`;
  const today = todayIsoDate();

  const payload = {
    invoiceNumber,
    invoiceReference: 'PO-E2E',
    invoiceDate: today,
    dueDate: todayIsoDate(new Date(Date.now() + 30 * 86_400_000)),
    currency: 'usd',
    description: 'Created by the e2e suite',
    customer: {
      fullname: 'E2E Customer Pty Ltd',
      email: 'e2e@example.com',
      mobileNumber: '+61 400 000 000',
      address: '1 Test Street, Sydney',
    },
    items: [{ name: 'Integration testing', quantity: 4, rate: 125.5 }],
    taxRate: 10,
    discount: 2,
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();

    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: process.env.SEED_USER_EMAIL,
        password: process.env.SEED_USER_PASSWORD,
      })
      .expect(200);
    token = res.body.accessToken;
  });

  afterAll(async () => {
    if (!app) return;
    await app
      .get(DataSource)
      .query(`DELETE FROM invoices WHERE invoice_number LIKE 'E2E-%'`);
    await app.close();
  });

  it('rejects requests without a token', async () => {
    const res = await request(app.getHttpServer()).get('/invoices').expect(401);
    expect(res.body).toMatchObject({ statusCode: 401, error: 'Unauthorized' });
  });

  it('returns the signed-in user from /auth/me', async () => {
    const res = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(res.body.email).toBe(process.env.SEED_USER_EMAIL?.toLowerCase());
  });

  it('creates an invoice, then finds it in the list and by id', async () => {
    const server = app.getHttpServer();
    const auth = { Authorization: `Bearer ${token}` };

    const created = await request(server)
      .post('/invoices')
      .set(auth)
      .send(payload)
      .expect(201);
    expect(created.body).toMatchObject({
      invoiceNumber,
      status: 'Draft',
      currency: 'USD',
      currencySymbol: 'US$',
      invoiceSubTotal: 502,
      totalTax: 50.2,
      totalDiscount: 2,
      totalAmount: 550.2,
      totalPaid: 0,
      balanceAmount: 550.2,
    });

    const list = await request(server)
      .get('/invoices')
      .query({ keyword: invoiceNumber.toLowerCase(), pageSize: 5 })
      .set(auth)
      .expect(200);
    expect(list.body.paging).toEqual({ page: 1, pageSize: 5, total: 1 });
    expect(list.body.data[0]).toMatchObject({
      invoiceId: created.body.invoiceId,
      invoiceNumber,
    });

    const byCustomer = await request(server)
      .get('/invoices')
      .query({ keyword: 'e2e customer' })
      .set(auth)
      .expect(200);
    expect(
      byCustomer.body.data.map(
        (i: { invoiceNumber: string }) => i.invoiceNumber,
      ),
    ).toContain(invoiceNumber);

    const detail = await request(server)
      .get(`/invoices/${created.body.invoiceId}`)
      .set(auth)
      .expect(200);
    expect(detail.body.items).toEqual([
      expect.objectContaining({
        name: 'Integration testing',
        quantity: 4,
        rate: 125.5,
        amount: 502,
      }),
    ]);
    expect(detail.body.customer).toEqual(payload.customer);
  });

  it('refuses a duplicate invoice number with 409', async () => {
    const res = await request(app.getHttpServer())
      .post('/invoices')
      .set('Authorization', `Bearer ${token}`)
      .send(payload)
      .expect(409);
    expect(res.body).toEqual({
      statusCode: 409,
      message: `Invoice number "${invoiceNumber}" already exists`,
      error: 'Conflict',
    });
  });

  it('returns structured validation errors', async () => {
    const res = await request(app.getHttpServer())
      .post('/invoices')
      .set('Authorization', `Bearer ${token}`)
      .send({
        ...payload,
        invoiceNumber: `${invoiceNumber}-X`,
        dueDate: '2000-01-01',
      })
      .expect(400);
    expect(res.body).toEqual({
      statusCode: 400,
      message: ['dueDate must be on or after invoiceDate'],
      error: 'Bad Request',
    });
  });

  it('returns 404 for an unknown invoice', async () => {
    await request(app.getHttpServer())
      .get('/invoices/00000000-0000-4000-8000-000000000000')
      .set('Authorization', `Bearer ${token}`)
      .expect(404, {
        statusCode: 404,
        message: 'Invoice not found',
        error: 'Not Found',
      });
  });
});
