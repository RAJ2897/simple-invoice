import { UnauthorizedException } from '@nestjs/common';
import bcrypt from 'bcryptjs';
import type { User } from '../users/user.entity.js';
import { AuthService } from './auth.service.js';

describe('AuthService', () => {
  const user: User = {
    id: 'ad1e0902-1928-4345-b513-60c86c94fc91',
    email: 'admin@simpleinvoice.dev',
    passwordHash: bcrypt.hashSync('correct-horse', 4),
    fullname: 'Admin User',
    createdAt: new Date('2026-06-01T00:00:00Z'),
  };

  function setup(found: User | null) {
    const users = {
      findByEmailWithPassword: vi.fn().mockResolvedValue(found),
      findById: vi.fn().mockResolvedValue(found),
    };
    const jwt = { signAsync: vi.fn().mockResolvedValue('signed.jwt.token') };
    const config = { get: vi.fn().mockReturnValue(3600) };
    const service = new AuthService(
      users as never,
      jwt as never,
      config as never,
    );
    return { service, jwt };
  }

  it('returns a bearer token and the profile for valid credentials', async () => {
    const { service, jwt } = setup(user);

    const result = await service.login(user.email, 'correct-horse');

    expect(jwt.signAsync).toHaveBeenCalledWith({
      sub: user.id,
      email: user.email,
    });
    expect(result).toMatchObject({
      accessToken: 'signed.jwt.token',
      tokenType: 'Bearer',
      expiresIn: 3600,
    });
    expect(result.user).not.toHaveProperty('passwordHash');
  });

  it('rejects a wrong password with a generic message', async () => {
    const { service } = setup(user);

    await expect(service.login(user.email, 'wrong')).rejects.toThrow(
      new UnauthorizedException('Invalid email or password'),
    );
  });

  it('rejects an unknown email with the same message', async () => {
    const { service } = setup(null);

    await expect(
      service.login('nobody@example.com', 'whatever'),
    ).rejects.toThrow(new UnauthorizedException('Invalid email or password'));
  });
});
