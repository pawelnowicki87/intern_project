import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { CreateUserDto } from 'src/auth/dto/create-user-payload';

@Injectable()
export class CoreUsersAdapter {
  private readonly logger = new Logger(CoreUsersAdapter.name);

  constructor(private readonly httpService: HttpService) {}

  async updateUserCredentials(
    userId: number,
    data: { 
      refreshTokenHash?: string | null; 
      passwordHash?: string },
  ) {
    try {
      const response = await firstValueFrom(
        this.httpService.patch(
          `${process.env.CORE_SERVICE_URL}/users/${userId}/credentials`,
          data,
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.warn(
        `Fail to update user credentials for user ${userId}. Error: ${error.message}`,
      );
      throw new HttpException(
        'Core microservice error while updating user credentials',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  async createUser(user: CreateUserDto) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${process.env.CORE_SERVICE_URL}/users`, user),
      );
      return response.data;
    } catch (error) {
      const status = error?.response?.status ?? HttpStatus.BAD_GATEWAY;
      const message =
        error?.response?.data?.message ??
        error.message ??
        'Core microservice error while creating a user';

      this.logger.warn(`Fail to create user in core ms. Error: ${message}`);
      throw new HttpException(message, status);
    }
  }

  async createOAuthUser(user: {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
  }) {
    return this.createUser({
      ...user,
      passwordHash: '',
    });
  }

  async getUserForAuth(email: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${process.env.CORE_SERVICE_URL}/users/auth`, {
          params: { email },
        }),
      );
      return response.data;
    } catch {
      return null;
    }
  }

  async getUserByEmail(email: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${process.env.CORE_SERVICE_URL}/users`, {
          params: { email },
        }),
      );
      return response.data;
    } catch {
      return null;
    }
  }

  async getUserByUsername(username: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${process.env.CORE_SERVICE_URL}/users`, {
          params: { username },
        }),
      );
      return response.data;
    } catch {
      return null;
    }
  }
}
