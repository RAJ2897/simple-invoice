import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import type { User } from '../users/user.entity.js';
import { UsersService } from '../users/users.service.js';
import type {
  LoginResponseDto,
  UserProfileDto,
} from './dto/auth-response.dto.js';
import type { JwtPayload } from './jwt.strategy.js';

// Compared against when the email is unknown, so a missing account takes about
// as long to reject as a wrong password (no user enumeration via timing).
const DUMMY_HASH = bcrypt.hashSync('timing-safe-placeholder', 10);

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async login(email: string, password: string): Promise<LoginResponseDto> {
    const user = await this.users.findByEmailWithPassword(email);
    const passwordMatches = await bcrypt.compare(
      password,
      user?.passwordHash ?? DUMMY_HASH,
    );

    if (!user || !passwordMatches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload: JwtPayload = { sub: user.id, email: user.email };
    return {
      accessToken: await this.jwt.signAsync(payload),
      tokenType: 'Bearer',
      expiresIn: this.config.get<number>('JWT_EXPIRES_IN', 3600),
      user: toProfile(user),
    };
  }

  async getProfile(userId: string): Promise<UserProfileDto> {
    const user = await this.users.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Account no longer exists');
    }
    return toProfile(user);
  }
}

function toProfile(user: User): UserProfileDto {
  return {
    id: user.id,
    email: user.email,
    fullname: user.fullname,
    createdAt: user.createdAt.toISOString(),
  };
}
