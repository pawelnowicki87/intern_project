import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { UnauthorizedError } from '../common/errors/domain-errors';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayloadDto } from './dto/jwt-payload.dto';
import { ValidatedUserDto } from './dto/validated-user.dto';
import { CoreUsersAdapter } from '../adapters/core-users.adapter';
import type { Response } from 'express';
import { OAuth2Client } from 'google-auth-library';


const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
);

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
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
    await this.coreUsersAdapter.updateUserCredentials(createdUser.id, {
      refreshTokenHash,
    });

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

  async validateUser(
    email: string,
    password: string,
  ): Promise<ValidatedUserDto> {
    const user = await this.coreUsersAdapter.getUserForAuth(email);

    if (!user || !user.passwordHash) {
      throw new UnauthorizedError('Password login not available');
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) throw new UnauthorizedError('Invalid credentials');

    return { id: user.id, email: user.email };
  }

  async loginWithCredentials(email: string, password: string) {
    const user = await this.validateUser(email, password);

    const { accessToken, refreshToken } = await this.generateTokens(user);

    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await this.coreUsersAdapter.updateUserCredentials(user.id, {
      refreshTokenHash,
    });

    return { accessToken, refreshToken, user };
  }


  async refresh(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.JWT_SECRET ?? 'default_secret',
      });

      const userId = payload.sub;

      const user = await this.coreUsersAdapter.getUserForAuth(payload.email);
      if (!user?.refreshTokenHash) {
        throw new UnauthorizedError('Refresh token not found');
      }

      const isValid = await bcrypt.compare(
        refreshToken,
        user.refreshTokenHash,
      );

      if (!isValid) {
        throw new UnauthorizedError('Invalid refresh token');
      }

      const { accessToken, refreshToken: newRefreshToken } =
        await this.generateTokens({
          id: userId,
          email: payload.email,
        });

      const newHash = await bcrypt.hash(newRefreshToken, 10);

      await this.coreUsersAdapter.updateUserCredentials(userId, {
        refreshTokenHash: newHash,
      });

      return { accessToken, refreshToken: newRefreshToken };
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
  }


  async logout(userId: number) {
    await this.coreUsersAdapter.updateUserCredentials(userId, {
      refreshTokenHash: null,
    });
  }

  async generateTokens(user: { id: number; email: string }) {
    const payload: JwtPayloadDto = { sub: user.id, email: user.email };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET ?? 'default_secret',
      expiresIn: (process.env.JWT_EXPIRES_IN ?? '15m') as JwtSignOptions['expiresIn'],
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET ?? 'default_secret',
      expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN ?? '7d') as JwtSignOptions['expiresIn'],
    });

    return { accessToken, refreshToken };
  }

  async registerAndSetCookies(registerDto: RegisterDto, res: Response) {
    const { accessToken, refreshToken, user } = await this.register(registerDto);
    res.cookie('refreshToken', refreshToken, this.getRefreshCookieOptions());
    return res.json({ accessToken, user });
  }

  async loginAndSetCookies(loginDto: LoginDto, res: Response) {
    const { accessToken, refreshToken, user } =
      await this.loginWithCredentials(loginDto.email, loginDto.password);

    res.cookie('refreshToken', refreshToken, this.getRefreshCookieOptions());
    return res.json({ accessToken, user });
  }

  async refreshAndRotateCookies(req: any, res: Response) {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token');
    }

    const { accessToken, refreshToken: newRefreshToken } = await this.refresh(refreshToken);
    res.cookie('refreshToken', newRefreshToken, this.getRefreshCookieOptions());
    return res.json({ accessToken });
  }

  async logoutAndClearCookies(req: any, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('Invalid user');
    }

    await this.logout(userId);

    res.clearCookie('refreshToken', {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });

    return res.json({ message: 'Logged out' });
  }

  async loginWithGoogleToken(idToken: string, res: Response) {

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload?.email) {
      throw new UnauthorizedException('Invalid Google token');
    }

    const email = payload.email;
    const firstName = payload.given_name ?? '';
    const lastName = payload.family_name ?? '';

    let user = await this.coreUsersAdapter.getUserByEmail(email);

    if (!user) {
      user = await this.coreUsersAdapter.createOAuthUser({
        firstName,
        lastName,
        email,
      });
    }

    const { accessToken, refreshToken } = await this.generateTokens({
      id: user.id,
      email: user.email,
    });

    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

    await this.coreUsersAdapter.updateUserCredentials(user.id, {
      refreshTokenHash,
    });

    res.cookie(
      'refreshToken',
      refreshToken,
      this.getRefreshCookieOptions(),
    );

    return res.json({
      accessToken,
      user,
    });
  }

}
