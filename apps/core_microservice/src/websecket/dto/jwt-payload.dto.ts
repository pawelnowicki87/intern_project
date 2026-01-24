export class JwtPayloadDto {
  sub: number|string;
  email: string;
  iat?: number;
  exp?: number;
}
