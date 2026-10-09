var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Body, Controller, Get, HttpCode, HttpStatus, Post, } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags, ApiTooManyRequestsResponse, ApiUnauthorizedResponse, } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { ErrorResponseDto } from '../common/dto/error-response.dto.js';
import { AuthService } from './auth.service.js';
import { CurrentUser } from './current-user.decorator.js';
import { LoginResponseDto, UserProfileDto } from './dto/auth-response.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { Public } from './public.decorator.js';
let AuthController = class AuthController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    login(dto) {
        return this.authService.login(dto.email, dto.password);
    }
    me(user) {
        return this.authService.getProfile(user.id);
    }
};
__decorate([
    Public(),
    Post('login'),
    HttpCode(HttpStatus.OK),
    Throttle({ default: { limit: 10, ttl: 60_000 } }),
    ApiOperation({
        summary: 'Sign in with email and password and receive a JWT',
    }),
    ApiOkResponse({ type: LoginResponseDto }),
    ApiBadRequestResponse({
        description: 'Validation failed',
        type: ErrorResponseDto,
    }),
    ApiUnauthorizedResponse({
        description: 'Invalid email or password',
        type: ErrorResponseDto,
    }),
    ApiTooManyRequestsResponse({
        description: 'Too many login attempts',
        type: ErrorResponseDto,
    }),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [LoginDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    Get('me'),
    ApiBearerAuth(),
    ApiOperation({ summary: 'Profile of the signed-in user' }),
    ApiOkResponse({ type: UserProfileDto }),
    ApiUnauthorizedResponse({
        description: 'Missing or invalid access token',
        type: ErrorResponseDto,
    }),
    __param(0, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "me", null);
AuthController = __decorate([
    ApiTags('Auth'),
    Controller('auth'),
    __metadata("design:paramtypes", [AuthService])
], AuthController);
export { AuthController };
//# sourceMappingURL=auth.controller.js.map