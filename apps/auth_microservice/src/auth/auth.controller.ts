import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  UnauthorizedException,
  Get,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthGuard } from '@nestjs/passport';
import type { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto, @Res() res: Response) {
    const { accessToken, refreshToken, user } = await this.authService.register(registerDto);
    res.cookie('refreshToken', refreshToken, this.authService.getRefreshCookieOptions());

    return res.json({
      message: 'User registered successfully',
      accessToken,
      user,
    });
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    const { accessToken, refreshToken, user } = await this.authService.loginWithCredentials(
      loginDto.email,
      loginDto.password,
    );
    res.cookie('refreshToken', refreshToken, this.authService.getRefreshCookieOptions());
    return res.json({ accessToken, user });
  }

  @Post('refresh')
  async refresh(@Req() req, @Res() res: Response) {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) throw new UnauthorizedException('No refresh token');

    const { accessToken, newRefreshToken } = await this.authService.refresh(refreshToken);

    res.cookie('refreshToken', newRefreshToken, this.authService.getRefreshCookieOptions());

    return res.json({ accessToken });
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() req, @Res() res: Response) {
    const userId = req.user?.sub;
    if (!userId) throw new UnauthorizedException('Invalid user');

    await this.authService.logout(userId);

    res.clearCookie('refreshToken', {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });

    return res.json({ message: 'Logged out' });
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res: Response) {
    const user = req.user;
    const { accessToken, refreshToken } = await this.authService.generateTokens({
      id: user.id,
      email: user.email,
    });

    res.cookie('refreshToken', refreshToken, this.authService.getRefreshCookieOptions());

    return res.json({ accessToken });
  }
}
