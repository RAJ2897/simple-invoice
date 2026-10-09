var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service.js';
const DUMMY_HASH = bcrypt.hashSync('timing-safe-placeholder', 10);
let AuthService = class AuthService {
    users;
    jwt;
    config;
    constructor(users, jwt, config) {
        this.users = users;
        this.jwt = jwt;
        this.config = config;
    }
    async login(email, password) {
        const user = await this.users.findByEmailWithPassword(email);
        const passwordMatches = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
        if (!user || !passwordMatches) {
            throw new UnauthorizedException('Invalid email or password');
        }
        const payload = { sub: user.id, email: user.email };
        return {
            accessToken: await this.jwt.signAsync(payload),
            tokenType: 'Bearer',
            expiresIn: this.config.get('JWT_EXPIRES_IN', 3600),
            user: toProfile(user),
        };
    }
    async getProfile(userId) {
        const user = await this.users.findById(userId);
        if (!user) {
            throw new UnauthorizedException('Account no longer exists');
        }
        return toProfile(user);
    }
};
AuthService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [UsersService,
        JwtService,
        ConfigService])
], AuthService);
export { AuthService };
function toProfile(user) {
    return {
        id: user.id,
        email: user.email,
        fullname: user.fullname,
        createdAt: user.createdAt.toISOString(),
    };
}
//# sourceMappingURL=auth.service.js.map