import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Delete,
  Patch,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { HiddenUserDto } from './dto/hidden-user.dto';
import { User } from './entities/user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch(':id/credentials')
  updateCredentials(
    @Param('id') id: number,
    @Body() data: { refreshTokenHash?: string; passwordHash?: string },
  ) {
    return this.usersService.updateCredentials(id, data);
  }

  @Get()
  find(@Query('email') email?: string) {
    return this.usersService.find(email);
  }

  @Get('auth')
  findForAuth(@Query('email') email: string) {
    return this.usersService.findByEmailForAuth(email);
  }

  @Get(':id')
  findOneVisible(
    @Param('id') id: number,
    @Query('viewerId') viewerId: number,
  ): Promise<UserResponseDto | HiddenUserDto> {
    return this.usersService.findOneVisible(viewerId, id);
  }

  @Patch(':id/privacy')
  updatePrivacy(
    @Param('id') id: number,
    @Body() data: { isPrivate: boolean },
  ) {
    return this.usersService.update(id, { isPrivate: data.isPrivate });
  }

  @Post()
  create(@Body() data: CreateUserDto & { passwordHash: string }) {
    return this.usersService.create(data);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() data: Partial<User>) {
    return this.usersService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.usersService.remove(id);
  }
}
