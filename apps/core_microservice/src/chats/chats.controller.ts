import { Controller, Get, Post, Delete, Param, Body, Patch } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { ChatResponseDto } from './dto/chat-response.dto';

@Controller('chats')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Get()
  findAll(): Promise<ChatResponseDto[]> {
    return this.chatsService.findAll();
  }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: number): Promise<ChatResponseDto[]> {
    return this.chatsService.findByUser(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<ChatResponseDto> {
    return this.chatsService.findOne(id);
  }

  @Post()
  create(@Body() data: CreateChatDto): Promise<ChatResponseDto> {
    return this.chatsService.create(data);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() data: { name?: string }): Promise<ChatResponseDto> {
    return this.chatsService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: number): Promise<{ deleted: boolean }> {
    return this.chatsService.remove(id);
  }
}
