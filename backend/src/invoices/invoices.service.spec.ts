import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import type { CreateInvoiceDto } from './dto/create-invoice.dto.js';
import { ListInvoicesQueryDto } from './dto/list-invoices-query.dto.js';
import type { Invoice } from './entities/invoice.entity.js';
import { InvoiceStatus, PersistedInvoiceStatus } from './invoice-status.js';
import { InvoicesService } from './invoices.service.js';

const USER_ID = '7b0c1f7e-1111-4c1e-9a4f-000000000001';

function makeInvoice(overrides: Partial<Invoice> = {}): Invoice {
  return {
    invoiceId: 'a3c1b4f0-0000-4000-8000-000000000001',
    invoiceNumber: 'INV-1',
    invoiceReference: null,
    invoiceDate: '2026-09-01',
    dueDate: '2026-09-30',
    currency: 'AUD',
    currencySymbol: 'AU$',
    description: null,
    status: PersistedInvoiceStatus.Pending,
    customerFullname: 'Jane Doe',
    customerEmail: 'jane@example.com',
    customerMobile: null,
    customerAddress: null,
    taxRate: 10,
    invoiceSubTotal: 100,
    totalTax: 10,
    totalDiscount: 0,
    totalAmount: 110,
    totalPaid: 0,
    balanceAmount: 110,
    createdAt: new Date('2026-09-01T10:00:00Z'),
    createdBy: USER_ID,
    items: [],
    ...overrides,
  };
}

function makeQueryBuilder(rows: Invoice[] = [], total = rows.length) {
  const qb = {
    andWhere: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    addOrderBy: vi.fn().mockReturnThis(),
    skip: vi.fn().mockReturnThis(),
    take: vi.fn().mockReturnThis(),
    getManyAndCount: vi.fn().mockResolvedValue([rows, total]),
  };
  return qb;
}

function setup() {
  const repo = {
    create: vi.fn((data: Partial<Invoice>) => ({ ...data }) as Invoice),
    save: vi.fn(),
    findOne: vi.fn(),
    createQueryBuilder: vi.fn(),
  };
  const service = new InvoicesService(repo as never);
  return { repo, service };
}

const createDto: CreateInvoiceDto = {
  invoiceNumber: 'INV-NEW-1',
  invoiceDate: '2026-10-01',
  dueDate: '2026-10-31',
  currency: 'GBP',
  customer: { fullname: 'Jane Doe', email: 'jane@example.com' },
  items: [{ name: 'Consulting', quantity: 2, rate: 150 }],
};

describe('InvoicesService', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-09T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('create', () => {
    it('stores a Draft invoice with server-calculated totals', async () => {
      const { repo, service } = setup();
      repo.save.mockImplementation(async (invoice: Invoice) => ({
        ...invoice,
        invoiceId: 'new-id',
      }));
      repo.findOne.mockResolvedValue(
        makeInvoice({
          invoiceId: 'new-id',
          status: PersistedInvoiceStatus.Draft,
        }),
      );

      await service.create({ ...createDto, discount: 30 }, USER_ID);

      const saved = repo.save.mock.calls[0][0] as Invoice;
      expect(saved).toMatchObject({
        status: PersistedInvoiceStatus.Draft,
        currencySymbol: '£',
        taxRate: 10,
        invoiceSubTotal: 300,
        totalTax: 30,
        totalDiscount: 30,
        totalAmount: 300,
        totalPaid: 0,
        balanceAmount: 300,
        createdBy: USER_ID,
      });
    });

    it('turns a unique-constraint violation into 409 Conflict', async () => {
      const { repo, service } = setup();
      repo.save.mockRejectedValue(
        new QueryFailedError(
          'INSERT ...',
          [],
          Object.assign(new Error('duplicate key'), { code: '23505' }),
        ),
      );

      await expect(service.create(createDto, USER_ID)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.create(createDto, USER_ID)).rejects.toThrow(
        'Invoice number "INV-NEW-1" already exists',
      );
    });

    it('rethrows other database errors untouched', async () => {
      const { repo, service } = setup();
      const failure = new QueryFailedError(
        'INSERT ...',
        [],
        Object.assign(new Error('boom'), { code: '08006' }),
      );
      repo.save.mockRejectedValue(failure);

      await expect(service.create(createDto, USER_ID)).rejects.toBe(failure);
    });

    it('rejects a discount larger than subtotal plus tax before touching the database', async () => {
      const { repo, service } = setup();

      await expect(
        service.create({ ...createDto, discount: 1000 }, USER_ID),
      ).rejects.toThrow(BadRequestException);
      expect(repo.save).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('throws 404 when the invoice does not exist', async () => {
      const { repo, service } = setup();
      repo.findOne.mockResolvedValue(null);

      await expect(service.findOne('missing')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('reports an unpaid invoice past its due date as Overdue', async () => {
      const { repo, service } = setup();
      repo.findOne.mockResolvedValue(makeInvoice({ dueDate: '2026-10-08' }));

      const result = await service.findOne('id');
      expect(result.status).toBe(InvoiceStatus.Overdue);
    });
  });

  describe('findAll', () => {
    function query(overrides: Partial<ListInvoicesQueryDto> = {}) {
      return Object.assign(new ListInvoicesQueryDto(), overrides);
    }

    it('returns data with the paging block', async () => {
      const { repo, service } = setup();
      const qb = makeQueryBuilder([makeInvoice()], 31);
      repo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.findAll(query({ page: 3, pageSize: 10 }));

      expect(result.paging).toEqual({ page: 3, pageSize: 10, total: 31 });
      expect(qb.skip).toHaveBeenCalledWith(20);
      expect(qb.take).toHaveBeenCalledWith(10);
    });

    it('filters Overdue as "not paid and due before today"', async () => {
      const { repo, service } = setup();
      const qb = makeQueryBuilder();
      repo.createQueryBuilder.mockReturnValue(qb);

      await service.findAll(query({ status: InvoiceStatus.Overdue }));

      expect(qb.andWhere).toHaveBeenCalledWith(
        'invoice.status <> :paid AND invoice.dueDate < :today',
        {
          paid: 'Paid',
          today: '2026-10-09',
        },
      );
    });

    it('excludes overdue rows when filtering by Pending', async () => {
      const { repo, service } = setup();
      const qb = makeQueryBuilder();
      repo.createQueryBuilder.mockReturnValue(qb);

      await service.findAll(query({ status: InvoiceStatus.Pending }));

      expect(qb.andWhere).toHaveBeenCalledWith(
        'invoice.status = :status AND invoice.dueDate >= :today',
        {
          status: 'Pending',
          today: '2026-10-09',
        },
      );
    });

    it('escapes LIKE wildcards in the search keyword', async () => {
      const { repo, service } = setup();
      const qb = makeQueryBuilder();
      repo.createQueryBuilder.mockReturnValue(qb);

      await service.findAll(query({ keyword: '50%_off' }));

      expect(qb.andWhere).toHaveBeenCalledWith(
        expect.stringContaining('ILIKE :keyword'),
        {
          keyword: '%50\\%\\_off%',
        },
      );
    });

    it('sorts by the requested column with a stable tie-breaker', async () => {
      const { repo, service } = setup();
      const qb = makeQueryBuilder();
      repo.createQueryBuilder.mockReturnValue(qb);

      await service.findAll(query({ sortBy: 'totalAmount', ordering: 'ASC' }));

      expect(qb.orderBy).toHaveBeenCalledWith('invoice.totalAmount', 'ASC');
      expect(qb.addOrderBy).toHaveBeenCalledWith(
        'invoice.invoiceNumber',
        'ASC',
      );
    });
  });
});
