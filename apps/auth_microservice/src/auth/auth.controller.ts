import { Controller, Post, Body, UseGuards, Req, Get, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import type { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto, @Res() res: Response) {
    return this.authService.registerAndSetCookies(registerDto, res);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    return this.authService.loginAndSetCookies(loginDto, res);
  }

  @Post('refresh')
  async refresh(@Req() req, @Res() res: Response) {
    return this.authService.refreshAndRotateCookies(req, res);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Req() req) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() req, @Res() res: Response) {
    return this.authService.logoutAndClearCookies(req, res);
  }

  @Post('google/token')
  async googleTokenLogin(
    @Body('idToken') idToken: string,
    @Res() res: Response,
  ) {
    return this.authService.loginWithGoogleToken(idToken, res);
  }
}
