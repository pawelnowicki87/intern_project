import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RedisService } from '../redis/redis.service';
import { RegisterDto } from './dto/register.dto';
import { JwtPayloadDto } from './dto/jwt-payload.dto';
import { ValidatedUserDto } from './dto/validated-user.dto';
import { CoreUsersAdapter } from '../adapters/core-users.adapter';

@Injectable()
export class AuthService {
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

  async validateUser(email: string, password: string): Promise<ValidatedUserDto> {
    const user = await this.coreUsersAdapter.getUserForAuth(email);
    if (!user || !user.passwordHash) throw new UnauthorizedException('User not found');

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) throw new UnauthorizedException('Invalid credentials');

    return { id: user.id, email: user.email };
  }

  async login(user: ValidatedUserDto) {
    return this.generateTokens(user);
  }

  async refresh(refreshToken: string) {
    try {
      const decoded = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.JWT_SECRET ?? 'default_secret',
      });

      const userId = decoded.sub;
      const stored = await this.redisService.get(`refresh:${userId}`);
      if (stored !== refreshToken) throw new UnauthorizedException('Invalid refresh token');

      const { accessToken, refreshToken: newRefreshToken } = await this.generateTokens({
        id: decoded.sub,
        email: decoded.email,
      });

      return { accessToken, newRefreshToken };
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
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
