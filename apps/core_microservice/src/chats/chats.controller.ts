import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
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

  @Get(':id')
  findOne(@Param('id') id: number): Promise<ChatResponseDto> {
    return this.chatsService.findOne(id);
  }

  @Post()
  create(@Body() data: CreateChatDto): Promise<ChatResponseDto> {
    return this.chatsService.create(data);
  }

  @Delete(':id')
  remove(@Param('id') id: number): Promise<{ message: string }> {
    return this.chatsService.remove(id);
  }
}
