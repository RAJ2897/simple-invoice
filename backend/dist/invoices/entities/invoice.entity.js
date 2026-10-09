var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, } from 'typeorm';
import { numericTransformer } from '../../common/utils/numeric.transformer.js';
import { User } from '../../users/user.entity.js';
import { PersistedInvoiceStatus } from '../invoice-status.js';
import { InvoiceItem } from './invoice-item.entity.js';
const money = {
    type: 'numeric',
    precision: 12,
    scale: 2,
    transformer: numericTransformer,
};
let Invoice = class Invoice {
    invoiceId;
    invoiceNumber;
    invoiceReference;
    invoiceDate;
    dueDate;
    currency;
    currencySymbol;
    description;
    status;
    customerFullname;
    customerEmail;
    customerMobile;
    customerAddress;
    taxRate;
    invoiceSubTotal;
    totalTax;
    totalDiscount;
    totalAmount;
    totalPaid;
    balanceAmount;
    createdAt;
    createdBy;
    creator;
    items;
};
__decorate([
    PrimaryGeneratedColumn('uuid', { name: 'invoice_id' }),
    __metadata("design:type", String)
], Invoice.prototype, "invoiceId", void 0);
__decorate([
    Column({ name: 'invoice_number', type: 'text', unique: true }),
    __metadata("design:type", String)
], Invoice.prototype, "invoiceNumber", void 0);
__decorate([
    Column({ name: 'invoice_reference', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], Invoice.prototype, "invoiceReference", void 0);
__decorate([
    Column({ name: 'invoice_date', type: 'date' }),
    __metadata("design:type", String)
], Invoice.prototype, "invoiceDate", void 0);
__decorate([
    Column({ name: 'due_date', type: 'date' }),
    __metadata("design:type", String)
], Invoice.prototype, "dueDate", void 0);
__decorate([
    Column({ type: 'text' }),
    __metadata("design:type", String)
], Invoice.prototype, "currency", void 0);
__decorate([
    Column({ name: 'currency_symbol', type: 'text' }),
    __metadata("design:type", String)
], Invoice.prototype, "currencySymbol", void 0);
__decorate([
    Column({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], Invoice.prototype, "description", void 0);
__decorate([
    Column({
        type: 'enum',
        enum: PersistedInvoiceStatus,
        enumName: 'invoice_status',
        default: PersistedInvoiceStatus.Draft,
    }),
    __metadata("design:type", String)
], Invoice.prototype, "status", void 0);
__decorate([
    Column({ name: 'customer_fullname', type: 'text' }),
    __metadata("design:type", String)
], Invoice.prototype, "customerFullname", void 0);
__decorate([
    Column({ name: 'customer_email', type: 'text' }),
    __metadata("design:type", String)
], Invoice.prototype, "customerEmail", void 0);
__decorate([
    Column({ name: 'customer_mobile', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], Invoice.prototype, "customerMobile", void 0);
__decorate([
    Column({ name: 'customer_address', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], Invoice.prototype, "customerAddress", void 0);
__decorate([
    Column({
        name: 'tax_rate',
        type: 'numeric',
        precision: 5,
        scale: 2,
        transformer: numericTransformer,
    }),
    __metadata("design:type", Number)
], Invoice.prototype, "taxRate", void 0);
__decorate([
    Column({ name: 'invoice_sub_total', ...money }),
    __metadata("design:type", Number)
], Invoice.prototype, "invoiceSubTotal", void 0);
__decorate([
    Column({ name: 'total_tax', ...money }),
    __metadata("design:type", Number)
], Invoice.prototype, "totalTax", void 0);
__decorate([
    Column({ name: 'total_discount', ...money }),
    __metadata("design:type", Number)
], Invoice.prototype, "totalDiscount", void 0);
__decorate([
    Column({ name: 'total_amount', ...money }),
    __metadata("design:type", Number)
], Invoice.prototype, "totalAmount", void 0);
__decorate([
    Column({ name: 'total_paid', ...money, default: 0 }),
    __metadata("design:type", Number)
], Invoice.prototype, "totalPaid", void 0);
__decorate([
    Column({ name: 'balance_amount', ...money }),
    __metadata("design:type", Number)
], Invoice.prototype, "balanceAmount", void 0);
__decorate([
    CreateDateColumn({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], Invoice.prototype, "createdAt", void 0);
__decorate([
    Column({ name: 'created_by', type: 'uuid' }),
    __metadata("design:type", String)
], Invoice.prototype, "createdBy", void 0);
__decorate([
    ManyToOne(() => User, { onDelete: 'RESTRICT' }),
    JoinColumn({ name: 'created_by' }),
    __metadata("design:type", User)
], Invoice.prototype, "creator", void 0);
__decorate([
    OneToMany(() => InvoiceItem, (item) => item.invoice, { cascade: ['insert'] }),
    __metadata("design:type", Array)
], Invoice.prototype, "items", void 0);
Invoice = __decorate([
    Entity({ name: 'invoices' })
], Invoice);
export { Invoice };
//# sourceMappingURL=invoice.entity.js.map