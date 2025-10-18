import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<UserResponseDto[]> {
    this.logger.log('Fetching all users...');
    const users = await this.userRepository.find();
    this.logger.debug(`Fetched ${users.length} users from database.`);

    return users.map(({ firstName, lastName, email, phone }) => ({
      firstName,
      lastName,
      email,
      phone,
    }));
  }

  async findOne(id: number): Promise<UserResponseDto> {
    this.logger.log(`Fetching user with ID=${id}`);
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      this.logger.warn(`User with ID=${id} not found.`);
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const { firstName, lastName, email, phone } = user;
    return { firstName, lastName, email, phone };
  }

  async create(data: CreateUserDto): Promise<UserResponseDto> {
    this.logger.log(`Creating new user with email=${data.email}`);
    try {
      const passwordHash = await bcrypt.hash(data.password, 10);

      const user = this.userRepository.create({
        ...data,
        passwordHash,
      });

      const savedUser = await this.userRepository.save(user);
      this.logger.debug(`User created with ID=${savedUser.id}`);

      const { firstName, lastName, email, phone } = savedUser;
      return { firstName, lastName, email, phone };
    } catch (error: unknown) {
      this.logger.error(
        `Error creating user: ${error instanceof Error ? error.message : error}`,
      );
      throw new InternalServerErrorException(
        error instanceof Error
          ? `Error while creating user: ${error.message}`
          : 'Unexpected error while creating user.',
      );
    }
  }

  async update(id: number, data: UpdateUserDto): Promise<UserResponseDto> {
    this.logger.log(`Updating user with ID=${id}`);
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      this.logger.warn(`User with ID=${id} not found for update.`);
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    try {
      if (data.password) {
        this.logger.debug(`Hashing new password for user ID=${id}`);
        const passwordHash = await bcrypt.hash(data.password, 10);
        (data as Partial<User>).passwordHash = passwordHash;
        delete data.password;
      }

      await this.userRepository.update(id, data);
      const updatedUser = await this.userRepository.findOne({ where: { id } });

      if (!updatedUser) {
        this.logger.error(`User with ID=${id} not found after update.`);
        throw new NotFoundException(`Updated user with ID ${id} not found`);
      }

      this.logger.debug(`User with ID=${id} updated successfully.`);

      const { firstName, lastName, email, phone } = updatedUser;
      return { firstName, lastName, email, phone };
    } catch (error: unknown) {
      this.logger.error(
        `Error updating user ID=${id}: ${error instanceof Error ? error.message : error}`,
      );
      throw new InternalServerErrorException(
        error instanceof Error
          ? `Error while updating user: ${error.message}`
          : 'Unexpected error while updating user.',
      );
    }
  }

  async remove(id: number): Promise<{ deleted: boolean }> {
    this.logger.warn(`Attempting to delete user with ID=${id}`);
    const result = await this.userRepository.delete(id);

    if (!result.affected) {
      this.logger.warn(`User with ID=${id} not found for deletion.`);
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    this.logger.log(`User with ID=${id} deleted successfully.`);
    return { deleted: true };
  }
}
