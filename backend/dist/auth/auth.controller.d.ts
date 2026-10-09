import { AuthService } from './auth.service.js';
import { type AuthUser } from './current-user.decorator.js';
import { LoginResponseDto, UserProfileDto } from './dto/auth-response.dto.js';
import { LoginDto } from './dto/login.dto.js';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(dto: LoginDto): Promise<LoginResponseDto>;
    me(user: AuthUser): Promise<UserProfileDto>;
}
