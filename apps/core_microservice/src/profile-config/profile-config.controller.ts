import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { ProfileConfigService } from './profile-config.service';
import { ProfileToProfileConfiguration } from './entities/profile-to-profile-configuration.entity';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('profile-config')
@Controller('profile-config')
export class ProfileConfigController {
  constructor(private readonly profileConfigService: ProfileConfigService) {}

  @Get()
  findAll(): Promise<ProfileToProfileConfiguration[]> {
    return this.profileConfigService.findAll();
  }

  @Get(':sourceUserId/:targetUserId')
  findOne(
    @Param('sourceUserId') sourceUserId: number,
    @Param('targetUserId') targetUserId: number,
  ): Promise<ProfileToProfileConfiguration> {
    return this.profileConfigService.findOne(sourceUserId, targetUserId);
  }

  @Post()
  create(@Body() data: Partial<ProfileToProfileConfiguration>) {
    return this.profileConfigService.create(data);
  }

  @Put(':sourceUserId/:targetUserId')
  update(
    @Param('sourceUserId') sourceUserId: number,
    @Param('targetUserId') targetUserId: number,
    @Body() data: Partial<ProfileToProfileConfiguration>,
  ) {
    return this.profileConfigService.update(sourceUserId, targetUserId, data);
  }

  @Delete(':sourceUserId/:targetUserId')
  remove(@Param('sourceUserId') sourceUserId: number, @Param('targetUserId') targetUserId: number) {
    return this.profileConfigService.remove(sourceUserId, targetUserId);
  }
}
