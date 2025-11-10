export interface CreateUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  passwordHash: string;
}
