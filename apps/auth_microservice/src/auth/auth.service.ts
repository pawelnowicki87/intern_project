import {
  Injectable,
  UnauthorizedException,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RedisService } from '../redis/redis.service';
import { RegisterDto } from './dto/register.dto';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { JwtPayloadDto } from './dto/jwt-payload.dto';
import { ValidatedUserDto } from './dto/validated-user.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    private readonly httpService: HttpService,
  ) {}

  // Register new user (Core hashes the password)
  async register(registerDto: RegisterDto) {
    const { firstName, lastName, email, phone, password } = registerDto;

    const newUser = { firstName, lastName, email, phone, password };

    try {
      const response = await firstValueFrom(
        this.httpService.post(`${process.env.CORE_SERVICE_URL}/users`, newUser),
      );

      const createdUser = response.data;

      const { accessToken, refreshToken } = await this.generateTokens({
        id: createdUser.id,
        email: createdUser.email,
      });

      return {
        message: 'User registered successfully',
        accessToken,
        refreshToken,
        user: createdUser,
      };
    } catch (error: any) {
      this.logger.error(
        `Error registering user in Core Microservice: ${
          error?.response?.data?.message || error?.message
        }`,
      );
      throw new HttpException(
        'Failed to register user in Core Microservice',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  // Validate user credentials (login)
  async validateUser(email: string, password: string): Promise<ValidatedUserDto> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${process.env.CORE_SERVICE_URL}/users/auth`, {
          params: { email },
        }),
      );

      const user = response.data;

      const hash = user.passwordHash;

      if (!hash) {
        throw new UnauthorizedException('User record does not contain password hash');
      }

      const isValid = await bcrypt.compare(password, hash);
      if (!isValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      return { id: user.id, email: user.email };
    } catch (error: any) {
      this.logger.warn(
        `Failed login attempt for ${email}: ${
          error?.response?.data?.message || error?.message
        }`,
      );
      throw new UnauthorizedException('Invalid email or password');
    }
  }




  // Login — issue JWT and store refresh token in Redis
  async login(user: ValidatedUserDto) {
    const { accessToken, refreshToken } = await this.generateTokens({
      id: user.id,
      email: user.email,
    });

    return { accessToken, refreshToken };
  }

  // Refresh access token
  async refresh(userId: string, token: string) {
    const storedToken = await this.redisService.get(`refresh:${userId}`);
    if (storedToken !== token) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const newAccessToken = this.jwtService.sign(
      { sub: userId },
      {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN as any|| '15m',
      },
    );

    return { accessToken: newAccessToken };
  }

  // Logout user (delete refresh token from Redis)
  async logout(userId: string) {
    await this.redisService.del(`refresh:${userId}`);
    this.logger.log(`User ID=${userId} logged out.`);
  }

  // Handle Google OAuth login or registration
  async validateGoogleUser(profile: any) {
    const email = profile.emails?.[0]?.value;
    const firstName = profile.name?.givenName || '';
    const lastName = profile.name?.familyName || '';

    try {
      const existingResponse = await firstValueFrom(
        this.httpService.get(`${process.env.CORE_SERVICE_URL}/users`, {
          params: { email },
        }),
      );

      const existingUser = existingResponse.data;
      if (existingUser) return existingUser;

      const createPayload = {
        firstName,
        lastName,
        email,
        password: 'google_user',
      };

      const createResponse = await firstValueFrom(
        this.httpService.post(`${process.env.CORE_SERVICE_URL}/users`, createPayload),
      );

      return createResponse.data;
    } catch (error: any) {
      this.logger.error(
        `Error handling Google OAuth user: ${
          error?.response?.data?.message || error?.message
        }`,
      );
      throw new HttpException(
        'Failed to handle Google user',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  // Generate access + refresh tokens, store refresh in Redis
  async generateTokens(user: { id: string | number; email: string }) {
    const payload: JwtPayloadDto = { sub: user.id, email: user.email };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN as any|| '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN as any|| '7d',
    });

    await this.redisService.set(
      `refresh:${user.id}`,
      refreshToken,
      7 * 24 * 60 * 60, // 7 days
    );

    return { accessToken, refreshToken };
  }
}
