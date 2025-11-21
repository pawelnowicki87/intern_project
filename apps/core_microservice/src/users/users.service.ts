import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  Logger,
  Inject,
} from '@nestjs/common';
import bcrypt from 'bcrypt';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { IVisibilityReader } from './ports/visibility-reader.port';
import { HiddenUserDto } from './dto/hidden-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly usersRepository: UsersRepository,
    @Inject('VISIBILITY_READER')
    private readonly visibilityReader: IVisibilityReader,
  ) {}

  private toHiddenUserDto(user: User): HiddenUserDto {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
    }

  }

  async updateCredentials(
    id: number,
    data: { refreshTokenHash?: string },
  ): Promise<{ updated: boolean }> {
    const user = await this.usersRepository.findById(id, ['credentials']);

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (data.refreshTokenHash) {
      user.credentials.refreshTokenHash = data.refreshTokenHash;
    }

    await this.usersRepository.save(user);

    return { updated: true };
  }

  async findByEmail(email: string): Promise<UserResponseDto | null> {
    const user = await this.usersRepository.findOneByEmail(email);
    if (!user) return null;

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      isPrivate: user.isPrivate,
    };
  }

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.usersRepository.findMany();
    return users.map(
      ({ id, firstName, lastName, email, phone, isPrivate }) => ({
        id,
        firstName,
        lastName,
        email,
        phone,
        isPrivate,
      }),
    );
  }

  async findOneVisible(
    viewerId: number,
    ownerId: number
): Promise<UserResponseDto | HiddenUserDto> {
    const user = await this.usersRepository.findById(ownerId);

    if (!user) {
      throw new NotFoundException(`User with ID ${ownerId} not found`);
    }

    const canView = await this.visibilityReader.canViewProfile(
      viewerId,
      ownerId,
    );

    return canView ? {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      isPrivate: user.isPrivate,
    } : this.toHiddenUserDto(user);
    
  }

  async create(data: CreateUserDto): Promise<UserResponseDto> {
    const exists = await this.usersRepository.findOneByEmail(data.email);
    if (exists) {
      throw new ConflictException('Email is already in use');
    }

    const created = await this.usersRepository.create(data);

    if (!created) {
      throw new InternalServerErrorException('User creation failed');
    }

    return {
      id: created.id,
      firstName: created.firstName,
      lastName: created.lastName,
      email: created.email,
      phone: created.phone,
      isPrivate: created.isPrivate,
    };
  }

  async update(id: number, data: UpdateUserDto): Promise<UserResponseDto> {
    if (data.password) {
      const passwordHash = await bcrypt.hash(data.password, 10);
      (data as any).passwordHash = passwordHash;
      delete data.password;
    }

    const updated = await this.usersRepository.update(id, data);
    if (!updated) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return {
      id: updated.id,
      firstName: updated.firstName,
      lastName: updated.lastName,
      email: updated.email,
      phone: updated.phone,
      isPrivate: updated.isPrivate,
    };
  }

  async remove(id: number): Promise<{ deleted: boolean }> {
    const success = await this.usersRepository.delete(id);
    if (!success) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return { deleted: true };
  }

  async findByEmailForAuth(email: string) {
    return this.usersRepository.findOneByEmail(email);
  }
}
