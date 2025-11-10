import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersRepository {
  private readonly logger = new Logger(UsersRepository.name);

  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  async findOneByEmail(email: string): Promise<User | null> {
    return this.repo.findOne({ where: { email } });
  }

  async findMany(): Promise<User[]> {
    return this.repo.find();
  }

async findById(id: number, relations: string[] = []): Promise<User | null> {
  return this.repo.findOne({
    where: { id },
    relations,
  });
}

  async create(data: Partial<User>): Promise<User | null> {
    try {
      const user = this.repo.create(data);
      return await this.repo.save(user);
    } catch (error) {
      this.logger.error(error.message);
      return null;
    }
  }

  async update(id: number, data: Partial<User>): Promise<User | null> {
    try {
      await this.repo.update(id, data);
      return this.findById(id);
    } catch (error) {
      this.logger.error(error.message);
      return null;
    }
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repo.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async save(user: User): Promise<User> {
  return this.repo.save(user);
}
}
