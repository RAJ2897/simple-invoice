var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { ApiProperty } from '@nestjs/swagger';
export class ErrorResponseDto {
    statusCode;
    message;
    error;
}
__decorate([
    ApiProperty({ example: 400 }),
    __metadata("design:type", Number)
], ErrorResponseDto.prototype, "statusCode", void 0);
__decorate([
    ApiProperty({
        oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
        example: ['dueDate must be on or after invoiceDate'],
    }),
    __metadata("design:type", Object)
], ErrorResponseDto.prototype, "message", void 0);
__decorate([
    ApiProperty({ example: 'Bad Request' }),
    __metadata("design:type", String)
], ErrorResponseDto.prototype, "error", void 0);
//# sourceMappingURL=error-response.dto.js.map