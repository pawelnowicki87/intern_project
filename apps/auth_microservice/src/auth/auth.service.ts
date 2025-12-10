import { Injectable, Logger } from '@nestjs/common';
import { UnauthorizedError } from '@shared/errors/domain-errors';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RedisService } from '../redis/redis.service';
import { RegisterDto } from './dto/register.dto';
import { JwtPayloadDto } from './dto/jwt-payload.dto';
import { ValidatedUserDto } from './dto/validated-user.dto';
import { CoreUsersAdapter } from '../adapters/core-users.adapter';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    private readonly coreUsersAdapter: CoreUsersAdapter,
  ) {}

  async register(registerDto: RegisterDto) {
    const passwordHash = await bcrypt.hash(registerDto.password, 10);
    const createdUser = await this.coreUsersAdapter.createUser({
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      username: registerDto.username,
      email: registerDto.email,
      phone: registerDto.phone,
      passwordHash,
    });

    const { accessToken, refreshToken } = await this.generateTokens({
      id: createdUser.id,
      email: createdUser.email,
    });

    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await this.coreUsersAdapter.updateUserCredentials(createdUser.id, { refreshTokenHash });


    return { accessToken, refreshToken, user: createdUser };
  }

  getRefreshCookieOptions() {
    return {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    };
  }

  async validateUser(email: string, password: string): Promise<ValidatedUserDto> {
    const user = await this.coreUsersAdapter.getUserForAuth(email);
    if (!user || !user.passwordHash) throw new UnauthorizedError('User not found');

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) throw new UnauthorizedError('Invalid credentials');

    return { id: user.id, email: user.email };
  }

  async login(user: ValidatedUserDto) {
    return this.generateTokens(user);
  }

  async loginWithCredentials(email: string, password: string) {
    const user = await this.validateUser(email, password);
    const tokens = await this.login(user);
    return { ...tokens, user };
  }

  async refresh(refreshToken: string) {
    try {
      const decoded = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.JWT_SECRET ?? 'default_secret',
      });

      const userId = decoded.sub;
      const stored = await this.redisService.get(`refresh:${userId}`);
      if (stored !== refreshToken) throw new UnauthorizedError('Invalid refresh token');

      const { accessToken, refreshToken: newRefreshToken } = await this.generateTokens({
        id: decoded.sub,
        email: decoded.email,
      });

      return { accessToken, newRefreshToken };
    } catch {
      this.logger.warn('refresh_failed');
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
  }

  async logout(userId: string) {
    await this.redisService.del(`refresh:${userId}`);
  }

  async generateTokens(user: { id: string; email: string }) {
    const payload: JwtPayloadDto = { sub: user.id, email: user.email };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET ?? 'default_secret',
      expiresIn: (process.env.JWT_EXPIRES_IN ?? '15m') as JwtSignOptions['expiresIn'],
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET ?? 'default_secret',
      expiresIn: (process.env.JWT_EXPIRES_IN ?? '15m') as JwtSignOptions['expiresIn'],
    });

    await this.redisService.set(`refresh:${user.id}`, refreshToken, 7 * 24 * 3600);
    return { accessToken, refreshToken };
  }
}
