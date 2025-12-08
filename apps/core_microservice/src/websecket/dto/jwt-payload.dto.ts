export class JwtPayloadDto {
  sub: number|string;        // userId
  email: string;
  iat?: number;
  exp?: number;
}
