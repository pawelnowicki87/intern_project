import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfileConfigService } from './profile-config.service';
import { ProfileConfigController } from './profile-config.controller';
import { ProfileToProfileConfiguration } from './entities/profile-to-profile-configuration.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProfileToProfileConfiguration])],
  controllers: [ProfileConfigController],
  providers: [ProfileConfigService],
  exports: [ProfileConfigService],
})
export class ProfileConfigModule {}
