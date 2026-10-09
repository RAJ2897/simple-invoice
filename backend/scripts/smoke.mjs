// Quick manual check against a running API: `node scripts/smoke.mjs`
const base = process.env.API_URL ?? 'http://localhost:3000';

async function call(method, path, body, token) {
  const res = await fetch(base + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, body: await res.json() };
}

const login = await call('POST', '/auth/login', {
  email: process.env.SEED_USER_EMAIL ?? 'admin@simpleinvoice.dev',
  password: process.env.SEED_USER_PASSWORD ?? 'Admin@123',
});
const token = login.body.accessToken;
console.log('login', login.status);

const number = `SMOKE-${Date.now()}`;
const invoice = {
  invoiceNumber: number,
  invoiceDate: '2026-10-09',
  dueDate: '2026-11-08',
  currency: 'aud',
  customer: { fullname: 'Smoke Test', email: 'smoke@example.com' },
  items: [{ name: 'Widget', quantity: 3, rate: 19.99 }],
  discount: 5,
};

console.log('missing fields', JSON.stringify(await call('POST', '/invoices', {}, token)));
const created = await call('POST', '/invoices', invoice, token);
console.log('create', created.status, JSON.stringify(created.body));
console.log('duplicate', JSON.stringify(await call('POST', '/invoices', invoice, token)));
console.log(
  'discount too big',
  JSON.stringify(await call('POST', '/invoices', { ...invoice, invoiceNumber: `${number}-B`, discount: 500 }, token)),
);
const list = await call('GET', `/invoices?keyword=${number}`, undefined, token);
console.log('in list', list.body.paging.total === 1, list.body.data[0]?.status);
