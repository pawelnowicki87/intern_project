import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get()
  findAll() {
    return this.messagesService.findAll();
  }

  @Get('unread/count/:userId')
  countUnread(@Param('userId') userId: number) {
    return this.messagesService.countUnread(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.messagesService.findOne(id);
  }

  @Post()
  create(@Body() data: CreateMessageDto) {
    return this.messagesService.create(data);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() data: UpdateMessageDto) {
    return this.messagesService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.messagesService.remove(id);
  }
}
