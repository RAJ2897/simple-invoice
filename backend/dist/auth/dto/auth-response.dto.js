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
export class UserProfileDto {
    id;
    email;
    fullname;
    createdAt;
}
__decorate([
    ApiProperty({ format: 'uuid' }),
    __metadata("design:type", String)
], UserProfileDto.prototype, "id", void 0);
__decorate([
    ApiProperty({ example: 'admin@simpleinvoice.dev' }),
    __metadata("design:type", String)
], UserProfileDto.prototype, "email", void 0);
__decorate([
    ApiProperty({ example: 'Admin User' }),
    __metadata("design:type", String)
], UserProfileDto.prototype, "fullname", void 0);
__decorate([
    ApiProperty({ example: '2026-06-01T09:00:00.000Z' }),
    __metadata("design:type", String)
], UserProfileDto.prototype, "createdAt", void 0);
export class LoginResponseDto {
    accessToken;
    tokenType;
    expiresIn;
    user;
}
__decorate([
    ApiProperty(),
    __metadata("design:type", String)
], LoginResponseDto.prototype, "accessToken", void 0);
__decorate([
    ApiProperty({ example: 'Bearer' }),
    __metadata("design:type", String)
], LoginResponseDto.prototype, "tokenType", void 0);
__decorate([
    ApiProperty({ example: 3600, description: 'Token lifetime in seconds' }),
    __metadata("design:type", Number)
], LoginResponseDto.prototype, "expiresIn", void 0);
__decorate([
    ApiProperty({ type: UserProfileDto }),
    __metadata("design:type", UserProfileDto)
], LoginResponseDto.prototype, "user", void 0);
//# sourceMappingURL=auth-response.dto.js.map