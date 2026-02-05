import { Injectable } from '@nestjs/common';
import { NotFoundError } from '../common/errors/domain-errors';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProfileToProfileConfiguration } from './entities/profile-to-profile-configuration.entity';

@Injectable()
export class ProfileConfigService {
  constructor(
    @InjectRepository(ProfileToProfileConfiguration)
    private readonly configRepo: Repository<ProfileToProfileConfiguration>,
  ) {}

  findAll() {
    return this.configRepo.find({ relations: ['sourceUser', 'targetUser'] });
  }

  async findOne(sourceUserId: number, targetUserId: number) {
    const entity = await this.configRepo.findOne({
      where: { sourceUserId, targetUserId },
      relations: ['sourceUser', 'targetUser'],
    });
    if (!entity) {
      throw new NotFoundError('Profile configuration not found');
    }
    return entity;
  }

  create(data: Partial<ProfileToProfileConfiguration>) {
    const entity = this.configRepo.create(data);
    return this.configRepo.save(entity);
  }

  async update(
    sourceUserId: number,
    targetUserId: number,
    data: Partial<ProfileToProfileConfiguration>,
  ) {
    const entity = await this.findOne(sourceUserId, targetUserId);
    Object.assign(entity, data);
    return this.configRepo.save(entity);
  }

  async remove(sourceUserId: number, targetUserId: number) {
    const entity = await this.findOne(sourceUserId, targetUserId);
    return this.configRepo.remove(entity);
  }
}
