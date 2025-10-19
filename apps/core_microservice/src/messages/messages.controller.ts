import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { MessageResponseDto } from './dto/message-response.dto';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get()
  findAll(): Promise<MessageResponseDto[]> {
    return this.messagesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<MessageResponseDto> {
    return this.messagesService.findOne(id);
  }

  @Post()
  create(@Body() data: CreateMessageDto): Promise<MessageResponseDto> {
    return this.messagesService.create(data);
  }

  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() data: UpdateMessageDto,
  ): Promise<MessageResponseDto> {
    return this.messagesService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: number): Promise<{ message: string }> {
    return this.messagesService.remove(id);
  }
}
