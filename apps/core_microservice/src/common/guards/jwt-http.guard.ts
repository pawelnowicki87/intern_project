import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { UsersRepository } from 'src/users/users.repository';
import { JwtPayloadDto } from 'src/websecket/dto/jwt-payload.dto';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtHttpGuard implements CanActivate {
  constructor(private readonly usersRepo: UsersRepository, private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const req = context.switchToHttp().getRequest();
    const auth = req.headers['authorization'] as string | undefined;

    if (!auth || !auth.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing bearer token');
    }

    const token = auth.slice('Bearer '.length);

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET || 'default_secret') as JwtPayloadDto;
      const userId = Number(payload.sub);
      if (!userId) throw new UnauthorizedException('Invalid token payload');

      const user = await this.usersRepo.findById(userId);
      if (!user) throw new UnauthorizedException('User not found');

      req.user = user;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
