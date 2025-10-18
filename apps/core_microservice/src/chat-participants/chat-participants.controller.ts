import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import { ChatParticipantsService } from './chat-participants.service';
import { CreateChatParticipantDto } from './dto/create-chat-participant.dto';
import { ChatParticipantResponseDto } from './dto/chat-participant-response.dto';

@Controller('chat-participants')
export class ChatParticipantsController {
  constructor(
    private readonly chatParticipantsService: ChatParticipantsService,
  ) {}

  @Get()
  findAll(): Promise<ChatParticipantResponseDto[]> {
    return this.chatParticipantsService.findAll();
  }

  @Get(':chatId/:userId')
  findOne(
    @Param('chatId') chatId: number,
    @Param('userId') userId: number,
  ): Promise<ChatParticipantResponseDto> {
    return this.chatParticipantsService.findOne(chatId, userId);
  }

  @Post()
  create(
    @Body() data: CreateChatParticipantDto,
  ): Promise<ChatParticipantResponseDto> {
    return this.chatParticipantsService.create(data);
  }

  @Delete(':chatId/:userId')
  remove(
    @Param('chatId') chatId: number,
    @Param('userId') userId: number,
  ): Promise<{ message: string }> {
    return this.chatParticipantsService.remove(chatId, userId);
  }
}
