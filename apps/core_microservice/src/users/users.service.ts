import { Injectable, Inject, Logger } from '@nestjs/common';
import {
  NotFoundError,
  ConflictError,
  InternalError,
} from '@shared/errors/domain-errors';

import { UsersRepository } from './users.repository';
import { UsersCredentialRepository } from './users-credencial.repository';

import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { HiddenUserDto } from './dto/hidden-user.dto';

import type { IVisibilityReader } from './ports/visibility-reader.port';
import { VISIBILITY_READER } from './ports/tokens';
import { CreateUserWithPasswordDto } from './dto/create-user.dto';
import { CreateOAuthUserDto } from './dto/create-OAuth-user.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly credentialsRepository: UsersCredentialRepository,
    @Inject(VISIBILITY_READER)
    private readonly visibilityReader: IVisibilityReader,
  ) {}

  private toHiddenUserDto(user: any): HiddenUserDto {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
    };
  }

  async updateCredentials(
    id: number,
    data: { refreshTokenHash?: string; passwordHash?: string },
  ) {
    if ('refreshTokenHash' in data) {
      await this.credentialsRepository.updateRefreshToken(
        id,
        data.refreshTokenHash ?? null,
      );
    }


    if (data.passwordHash) {
      await this.credentialsRepository.updatePassword(id, data.passwordHash);
    }

    return { updated: true };
  }

  async find(email?: string): Promise<any> {
    if (email) return this.findByEmail(email);
    return this.findAll();
  }

  findByEmail(email: string): Promise<UserResponseDto | null> {
    return this.usersRepository.findOneByEmail(email);
  }

  findByUserName(userName: string) {
    return this.usersRepository.findOneByUserName(userName);
  }

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.usersRepository.findMany();

    return users.map((user) => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
      phone: user.phone,
      isPrivate: user.isPrivate,
    }));
  }

  async findOneVisible(viewerId: number, ownerId: number) {
    const user = await this.usersRepository.findById(ownerId);
    if (!user) {
      throw new NotFoundError(`User with ID ${ownerId} not found`);
    }

    const canView = await this.visibilityReader.canViewProfile(
      viewerId,
      ownerId,
    );

    return canView
      ? {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        isPrivate: user.isPrivate,
      }
      : this.toHiddenUserDto(user);
  }

  async create(
    data: CreateUserWithPasswordDto & { passwordHash: string },
  ): Promise<UserResponseDto> {
    const exists = await this.usersRepository.findOneByEmail(data.email);
    if (exists) {
      throw new ConflictError('Email is already in use');
    }

    const usernameExists = await this.usersRepository.findOneByUserName(
      data.username,
    );
    if (usernameExists) {
      throw new ConflictError('Username is already in use');
    }

    const user = await this.usersRepository.create({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      username: data.username,
      phone: data.phone,
    });

    if (!user) {
      throw new InternalError('User creation failed');
    }

    await this.credentialsRepository.createForUser(
      user.id,
      data.passwordHash,
    );

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
      phone: user.phone,
      isPrivate: user.isPrivate,
    };
  }

  async update(id: number, data: UpdateUserDto) {
    const updated = await this.usersRepository.update(id, data);
    if (!updated) {
      throw new NotFoundError(`User with ID ${id} not found`);
    }

    return {
      id: updated.id,
      firstName: updated.firstName,
      lastName: updated.lastName,
      username: updated.username,
      email: updated.email,
      phone: updated.phone,
      isPrivate: updated.isPrivate,
    };
  }

  async remove(id: number) {
    const success = await this.usersRepository.delete(id);
    if (!success) {
      throw new NotFoundError(`User with ID ${id} not found`);
    }
    return { deleted: true };
  }

  async findByEmailForAuth(email: string) {
    const user = await this.usersRepository.findOneByEmail(email);
    if (!user) {
      throw new NotFoundError('Email does not exist in database');
    }

    const passwordHash =
      await this.credentialsRepository.getPasswordByUserId(user.id);

    if (!passwordHash || passwordHash.trim() === '') {
      throw new NotFoundError('Password not found for this account');
    }

    const refreshTokenHash =
      await this.credentialsRepository.getRefreshTokenByUserId(user.id);

    return {
      id: user.id,
      email: user.email,
      passwordHash,
      refreshTokenHash,
    };
  }


  async createOAuthUser(data: CreateOAuthUserDto) {
    const existing = await this.usersRepository.findOneByEmail(data.email);
    if (existing) {
      return {
        id: existing.id,
        firstName: existing.firstName,
        lastName: existing.lastName,
        username: existing.username,
        email: existing.email,
        phone: existing.phone,
        isPrivate: existing.isPrivate,
      };
    }

    const username = await this.generateUniqueUsername(
      data.firstName,
      data.lastName,
    );

    const user = await this.usersRepository.create({
      firstName: data.firstName,
      lastName: data.lastName,
      username,
      email: data.email,
    });

    if (!user) {
      throw new InternalError('User creation failed');
    }

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
      phone: user.phone,
      isPrivate: user.isPrivate,
    };
  }


  private async generateUniqueUsername(
    firstName: string,
    lastName: string,
  ): Promise<string> {
    const base = (firstName + lastName)
      .toLowerCase()
      .replace(/\s+/g, '');

    for (let i = 0; i < 10; i++) {
      const random = Math.floor(Math.random() * 100)
        .toString()
        .padStart(2, '0');

      const username = `${base}${random}`;

      const exists = await this.usersRepository.findOneByUserName(username);
      if (!exists) {
        return username;
      }
    }

    throw new ConflictError('Failed to generate unique username');
  }


}
