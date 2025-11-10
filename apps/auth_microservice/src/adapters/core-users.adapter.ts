import { HttpService } from "@nestjs/axios";
import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import { firstValueFrom } from "rxjs";
import { CreateUserPayload } from "src/auth/dto/create-user-payload";

@Injectable()
export class CoreUsersAdapter {
  private readonly logger = new Logger(CoreUsersAdapter.name);

  constructor(private readonly httpService: HttpService){}

  async updateUserCredentials(userId: number, data: { refreshTokenHash?: string }) {
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

  async createUser(user: CreateUserPayload) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${process.env.CORE_SERVICE_URL}/users`, user)
      )
      return response.data;
    } 
    catch (error) {
      this.logger.warn(`Fail to create user in core ms. Error: ${error.message}`);
      throw new HttpException('Core ms error while creating a user', HttpStatus.BAD_GATEWAY)
    }
  }

  async getUserForAuth(email: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${process.env.CORE_SERVICE_URL}/users`, {
          params: { email },
        }),
      );
      return response.data;
    }
    catch (error) {
      this.logger.warn(
        `User lookup failed for ${email}: ${
          error?.response?.data?.message || error.message
        }`,
      );
      return null;
    }
  }
};


