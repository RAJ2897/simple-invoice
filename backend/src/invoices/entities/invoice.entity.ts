import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { numericTransformer } from '../../common/utils/numeric.transformer.js';
import { User } from '../../users/user.entity.js';
import { PersistedInvoiceStatus } from '../invoice-status.js';
import { InvoiceItem } from './invoice-item.entity.js';

const money = {
  type: 'numeric' as const,
  precision: 12,
  scale: 2,
  transformer: numericTransformer,
};

@Entity({ name: 'invoices' })
export class Invoice {
  @PrimaryGeneratedColumn('uuid', { name: 'invoice_id' })
  invoiceId: string;

  @Column({ name: 'invoice_number', type: 'text', unique: true })
  invoiceNumber: string;

  @Column({ name: 'invoice_reference', type: 'text', nullable: true })
  invoiceReference: string | null;

  @Column({ name: 'invoice_date', type: 'date' })
  invoiceDate: string;

  @Column({ name: 'due_date', type: 'date' })
  dueDate: string;

  @Column({ type: 'text' })
  currency: string;

  @Column({ name: 'currency_symbol', type: 'text' })
  currencySymbol: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({
    type: 'enum',
    enum: PersistedInvoiceStatus,
    enumName: 'invoice_status',
    default: PersistedInvoiceStatus.Draft,
  })
  status: PersistedInvoiceStatus;

  // Customer details are stored on the invoice itself (see README > Design decisions).
  @Column({ name: 'customer_fullname', type: 'text' })
  customerFullname: string;

  @Column({ name: 'customer_email', type: 'text' })
  customerEmail: string;

  @Column({ name: 'customer_mobile', type: 'text', nullable: true })
  customerMobile: string | null;

  @Column({ name: 'customer_address', type: 'text', nullable: true })
  customerAddress: string | null;

  @Column({
    name: 'tax_rate',
    type: 'numeric',
    precision: 5,
    scale: 2,
    transformer: numericTransformer,
  })
  taxRate: number;

  @Column({ name: 'invoice_sub_total', ...money })
  invoiceSubTotal: number;

  @Column({ name: 'total_tax', ...money })
  totalTax: number;

  @Column({ name: 'total_discount', ...money })
  totalDiscount: number;

  @Column({ name: 'total_amount', ...money })
  totalAmount: number;

  @Column({ name: 'total_paid', ...money, default: 0 })
  totalPaid: number;

  @Column({ name: 'balance_amount', ...money })
  balanceAmount: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'created_by' })
  creator?: User;

  @OneToMany(() => InvoiceItem, (item) => item.invoice, { cascade: ['insert'] })
  items: InvoiceItem[];
}
