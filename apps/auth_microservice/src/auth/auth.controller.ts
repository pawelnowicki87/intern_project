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

  // Register a new user
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  // Standard login
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const { email, password } = loginDto

    const user = await this.authService.validateUser(
      email,
      password,
    );
    return this.authService.login(user);
  }

  // Refresh access token
  @Post('refresh')
  async refresh(@Body() body: { userId: string; refreshToken: string }) {
    return this.authService.refresh(body.userId, body.refreshToken);
  }

  // Logout user
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() req: any) {
    const userId = req.user?.sub;
    if (!userId) throw new UnauthorizedException('Invalid user');
    await this.authService.logout(userId);
    return { message: 'Logged out' };
  }

  // Step 1: redirect user to Google
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Passport handles redirection
  }

  // Step 2: handle callback from Google, issue tokens, and redirect to frontend
  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res: Response) {
    const user = req.user;

    // Generate tokens using AuthService
    const { accessToken, refreshToken } = await this.authService.generateTokens({
      id: user.id,
      email: user.email,
    });

    // Redirect to frontend
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    return res.redirect(
      `${clientUrl}?accessToken=${accessToken}&refreshToken=${refreshToken}`,
    );
  }
}
