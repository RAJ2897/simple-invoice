var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, } from 'typeorm';
import { numericTransformer } from '../../common/utils/numeric.transformer.js';
let InvoiceItem = class InvoiceItem {
    id;
    invoiceId;
    name;
    quantity;
    rate;
    invoice;
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], InvoiceItem.prototype, "id", void 0);
__decorate([
    Column({ name: 'invoice_id', type: 'uuid' }),
    __metadata("design:type", String)
], InvoiceItem.prototype, "invoiceId", void 0);
__decorate([
    Column({ type: 'text' }),
    __metadata("design:type", String)
], InvoiceItem.prototype, "name", void 0);
__decorate([
    Column({ type: 'integer' }),
    __metadata("design:type", Number)
], InvoiceItem.prototype, "quantity", void 0);
__decorate([
    Column({
        type: 'numeric',
        precision: 12,
        scale: 2,
        transformer: numericTransformer,
    }),
    __metadata("design:type", Number)
], InvoiceItem.prototype, "rate", void 0);
__decorate([
    ManyToOne('Invoice', (invoice) => invoice.items, {
        onDelete: 'CASCADE',
    }),
    JoinColumn({ name: 'invoice_id' }),
    __metadata("design:type", Function)
], InvoiceItem.prototype, "invoice", void 0);
InvoiceItem = __decorate([
    Entity({ name: 'invoice_items' })
], InvoiceItem);
export { InvoiceItem };
//# sourceMappingURL=invoice-item.entity.js.map