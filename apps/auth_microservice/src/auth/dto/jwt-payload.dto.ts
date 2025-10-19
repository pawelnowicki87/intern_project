export type JwtPayloadDto = Record<string, any> & {
  sub: string | number;
  email: string;
};
