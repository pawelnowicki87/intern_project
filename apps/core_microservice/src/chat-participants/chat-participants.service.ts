import { Injectable } from '@nestjs/common';
import { NotFoundError, InternalError } from '../common/errors/domain-errors';
import { ChatParticipantsRepository } from './chat-participants.repository';
import { CreateChatParticipantDto } from './dto/create-chat-participant.dto';
import { ChatParticipantResponseDto } from './dto/chat-participant-response.dto';

@Injectable()
export class ChatParticipantsService {
  constructor(private readonly participantsRepo: ChatParticipantsRepository) {}

  private toResponseDto(participant: any): ChatParticipantResponseDto {
    return {
      chatId: participant.chatId,
      userId: participant.userId,
      joinedAt: participant.joinedAt,
      userFirstName: participant.user?.firstName,
      userLastName: participant.user?.lastName,
      userEmail: participant.user?.email,
    };
  }

  async findAll(): Promise<ChatParticipantResponseDto[]> {
    const participants = await this.participantsRepo.findAll();
    return participants.map((participant) => this.toResponseDto(participant));
  }

  async findOne(chatId: number, userId: number): Promise<ChatParticipantResponseDto> {
    const participant = await this.participantsRepo.findOne(chatId, userId);
    if (!participant) throw new NotFoundError('Participant not found');
    return this.toResponseDto(participant);
  }

  async create(data: CreateChatParticipantDto): Promise<ChatParticipantResponseDto> {
    const created = await this.participantsRepo.create(data);

    if (!created) {
      throw new InternalError('Failed to add participant');
    }

    const participant = await this.participantsRepo.findOne(
      created.chatId,
      created.userId,
    );
    if (!participant) {
      throw new NotFoundError('Participant not found after creation');
    }

    return this.toResponseDto(participant);
  }

  async remove(chatId: number, userId: number): Promise<{ deleted: boolean }> {
    const success = await this.participantsRepo.delete(chatId, userId);

    if (!success) throw new NotFoundError('Participant not found');

    return { deleted: true };
  }

  async isUserInChat(chatId: number, userId: number): Promise<boolean> {
    const participant = await this.participantsRepo.findOne(chatId, userId);
    return participant !== null;
  }
}
