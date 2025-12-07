import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UserCredentials } from "./entities/user-credencials.entity";

@Injectable()
export class UsersCredentialRepository {

  constructor(
    @InjectRepository(UserCredentials)
    private readonly repo: Repository<UserCredentials>,
  ) {}

  async createForUser(userId: number, passwordHash: string): Promise<UserCredentials> {
    try {
      const entry = this.repo.create({
        passwordHash,
        user: { id: userId },
      });
      return await this.repo.save(entry);
    } catch {
      throw new InternalServerErrorException("Failed to create user credentials");
    }
  }

  async updatePassword(userId: number, passwordHash: string): Promise<void> {
    const result = await this.repo.update({ user: { id: userId } }, { passwordHash });
    if (!result.affected) {
      throw new InternalServerErrorException("Failed to update password");
    }
  }

  async updateRefreshToken(userId: number, refreshTokenHash: string): Promise<void> {
    const result = await this.repo.update({ user: { id: userId } }, { refreshTokenHash });
    if (!result.affected) {
      throw new InternalServerErrorException("Failed to update refresh token");
    }
  }

    async getPasswordByUserId(userId: number): Promise<string | null> {
    const creds = await this.repo.createQueryBuilder("cred")
        .select("cred.passwordHash", "passwordHash")
        .where("cred.user_id = :id", { id: userId })
        .getRawOne();

    return creds?.passwordHash ?? null;
    }

}
