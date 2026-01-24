import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { Socket } from 'socket.io';
import { JwtPayloadDto } from '../dto/jwt-payload.dto';

@Injectable()
export class WsJwtGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const client: Socket = context.switchToWs().getClient();
    const token = client.handshake.auth?.token;

    if (!token) {
      throw new UnauthorizedException('Missing token');
    }

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET) as JwtPayloadDto;

      client.data.userId = payload.sub;

      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
