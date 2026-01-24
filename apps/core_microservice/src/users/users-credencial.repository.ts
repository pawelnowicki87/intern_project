import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserCredentials } from './entities/user-credencials.entity';

@Injectable()
export class UsersCredentialRepository {
  private readonly logger = new Logger(UsersCredentialRepository.name);

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
      const saved = await this.repo.save(entry);
      return saved;
    } catch (e: any) {
      this.logger.error(e?.message ?? String(e));
      throw new InternalServerErrorException('Failed to create user credentials');
    }
  }

  async updatePassword(userId: number, passwordHash: string): Promise<void> {
    const result = await this.repo.update({ user: { id: userId } }, { passwordHash });
    if (!result.affected) {
      this.logger.error('No rows affected when updating password');
      throw new InternalServerErrorException('Failed to update password');
    }
  }

  async updateRefreshToken(
    userId: number,
    refreshTokenHash: string | null,
  ): Promise<void> {
    const result = await this.repo.update(
      { user: { id: userId } },
      { refreshTokenHash },
    );

    if (!result.affected) {
      await this.repo.insert({
        user: { id: userId },
        refreshTokenHash,
      });
    }
  }

  async getPasswordByUserId(userId: number): Promise<string | null> {
    const raw = await this.repo
      .createQueryBuilder('cred')
      .select('cred.passwordHash', 'passwordHash')
      .where('cred.user_id = :id', { id: userId })
      .getRawOne<{ passwordHash?: string }>();
    const pwd = raw?.passwordHash ?? null;
    return pwd;
  }

  async getRefreshTokenByUserId(userId: number): Promise<string | null> {
    const raw = await this.repo
      .createQueryBuilder('cred')
      .select('cred.refreshTokenHash', 'refreshTokenHash')
      .where('cred.user_id = :id', { id: userId })
      .getRawOne<{ refreshTokenHash?: string }>();

    return raw?.refreshTokenHash ?? null;
  }


}
