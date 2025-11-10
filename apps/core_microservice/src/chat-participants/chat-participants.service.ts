import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ChatParticipantsRepository } from './chat-participants.repository';
import { CreateChatParticipantDto } from './dto/create-chat-participant.dto';
import { ChatParticipantResponseDto } from './dto/chat-participant-response.dto';

@Injectable()
export class ChatParticipantsService {
  constructor(private readonly participantsRepo: ChatParticipantsRepository) {}

  private toResponseDto(p: any): ChatParticipantResponseDto {
    return {
      chatId: p.chatId,
      userId: p.userId,
      joinedAt: p.joinedAt,
      userFirstName: p.user?.firstName,
      userLastName: p.user?.lastName,
      userEmail: p.user?.email,
    };
  }

  async findAll(): Promise<ChatParticipantResponseDto[]> {
    const participants = await this.participantsRepo.findAll();
    return participants.map((p) => this.toResponseDto(p));
  }

  async findOne(chatId: number, userId: number): Promise<ChatParticipantResponseDto> {
    const participant = await this.participantsRepo.findOne(chatId, userId);
    if (!participant) throw new NotFoundException('Participant not found');
    return this.toResponseDto(participant);
  }

  async create(data: CreateChatParticipantDto): Promise<ChatParticipantResponseDto> {
    const created = await this.participantsRepo.create(data);

    if (!created) {
      throw new InternalServerErrorException('Failed to add participant');
    }

    const participant = await this.participantsRepo.findOne(
      created.chatId,
      created.userId,
    );
    if (!participant) {
      throw new NotFoundException('Participant not found after creation');
    }

    return this.toResponseDto(participant);
  }

  async remove(chatId: number, userId: number): Promise<{ deleted: boolean }> {
    const success = await this.participantsRepo.delete(chatId, userId);

    if (!success) throw new NotFoundException('Participant not found');

    return { deleted: true };
  }
}
