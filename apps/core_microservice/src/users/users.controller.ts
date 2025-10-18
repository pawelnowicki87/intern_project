import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Delete,
  Patch,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UserResponseDto } from './dto/user-response.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.usersService.findAll();
    return users;
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<UserResponseDto> {
    const user = await this.usersService.findOne(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  @Post()
  async create(@Body() data: CreateUserDto): Promise<UserResponseDto> {
    return this.usersService.create(data);
  }

  @Patch(':id')
  async update(@Param('id') id: number, @Body() data: Partial<User>): Promise<UserResponseDto> {
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
