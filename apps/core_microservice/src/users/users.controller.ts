import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Delete,
  Patch,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UserResponseDto } from './dto/user-response.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { HiddenUserDto } from './dto/hidden-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch(':id/credentials')
  async updateCretentials(
    @Param('id') id: number,
    @Body() data: { refreshTokenHash: string }
  ): Promise<{ message: string }> {
    await this.usersService.updateCredentials(id, data);
    return { message: 'User credentials updated' };
  }

  @Get()
  async find(
    @Query('email') email: string,
  ): Promise<UserResponseDto | UserResponseDto[]> {
    if (email) {
      const user = await this.usersService.findByEmail(email);
      if (!user) {
        throw new NotFoundException(`User with email ${email} not found`);
      }
      return user;
    }
    return this.usersService.findAll();
  }

  @Get('auth')
  async findForAuth(@Query('email') email: string): Promise<User> {
    const user = await this.usersService.findByEmailForAuth(email);
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return user;
  }

  @Get(':id')
  async findOneVisible(
    @Param('id') id: number,
    @Query('viewerId') viewerId: number
  ): Promise<UserResponseDto | HiddenUserDto> {
    return this.usersService.findOneVisible(viewerId, id);
  }

  @Patch(':id/privacy')
  async updatePrivacy(
    @Param('id') id: number,
    @Body() data: { isPrivate: boolean },
  ): Promise<UserResponseDto> {
    return this.usersService.update(id, { isPrivate: data.isPrivate });
  }

  @Post()
  async create(@Body() data: CreateUserDto): Promise<UserResponseDto> {
    return this.usersService.create(data);
  }

  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() data: Partial<User>,
  ): Promise<UserResponseDto> {
    const updatedUser = await this.usersService.update(id, data);
    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return updatedUser;
  }

  @Delete(':id')
  async remove(@Param('id') id: number): Promise<{ message: string }> {
    const result = await this.usersService.remove(id);
    if (!result) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return { message: `User with ID ${id} removed successfully` };
  }
}
