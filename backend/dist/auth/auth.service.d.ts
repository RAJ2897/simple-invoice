import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service.js';
import type { LoginResponseDto, UserProfileDto } from './dto/auth-response.dto.js';
export declare class AuthService {
    private readonly users;
    private readonly jwt;
    private readonly config;
    constructor(users: UsersService, jwt: JwtService, config: ConfigService);
    login(email: string, password: string): Promise<LoginResponseDto>;
    getProfile(userId: string): Promise<UserProfileDto>;
}
