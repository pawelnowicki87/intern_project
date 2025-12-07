import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  Logger,
  Inject,
} from '@nestjs/common';

import { UsersRepository } from './users.repository';
import { UsersCredentialRepository } from './users-credencial.repository';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { HiddenUserDto } from './dto/hidden-user.dto';

import { IVisibilityReader } from './ports/visibility-reader.port';
import { VISIBILITY_READER } from './ports/tokens';

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

  async updateCredentials(id: number, data: { refreshTokenHash?: string; passwordHash?: string }) {
    if (data.refreshTokenHash) {
      await this.credentialsRepository.updateRefreshToken(id, data.refreshTokenHash);
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
    return users.map(user => ({
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
    if (!user) throw new NotFoundException(`User with ID ${ownerId} not found`);

    const canView = await this.visibilityReader.canViewProfile(viewerId, ownerId);

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

  async create(data: CreateUserDto & { passwordHash: string }): Promise<UserResponseDto> {
    const exists = await this.usersRepository.findOneByEmail(data.email);
    if (exists) throw new ConflictException('Email is already in use');

    const user = await this.usersRepository.create({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      username: data.username,
      phone: data.phone,
    });

    if (!user) throw new InternalServerErrorException('User creation failed');

    await this.credentialsRepository.createForUser(user.id, data.passwordHash);

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
    if (!updated) throw new NotFoundException(`User with ID ${id} not found`);

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
    if (!success) throw new NotFoundException(`User with ID ${id} not found`);
    return { deleted: true };
  }

  async findByEmailForAuth(email: string) {
    const user = await this.usersRepository.findOneByEmail(email);
    if (!user) throw new NotFoundException('Email does not exist in database');

    const passwordHash = await this.credentialsRepository.getPasswordByUserId(user.id);
    if (!passwordHash) throw new NotFoundException('Password does not exist');

    return {
      id: user.id,
      email: user.email,
      passwordHash,
    };
  }
}
