import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatParticipant } from './entities/chat-participant.entity';
import { CreateChatParticipantDto } from './dto/create-chat-participant.dto';
import { ChatParticipantResponseDto } from './dto/chat-participant-response.dto';

@Injectable()
export class ChatParticipantsService {
  constructor(
    @InjectRepository(ChatParticipant)
    private readonly participantRepo: Repository<ChatParticipant>,
  ) {}

  async findAll(): Promise<ChatParticipantResponseDto[]> {
    const participants = await this.participantRepo.find({
      relations: ['chat', 'user'],
      order: { joinedAt: 'DESC' },
    });

    return participants.map(({ chatId, userId, joinedAt, user }) => ({
      chatId,
      userId,
      joinedAt,
      userFirstName: user?.firstName,
      userLastName: user?.lastName,
      userEmail: user?.email,
    }));
  }

  async findOne(chatId: number, userId: number): Promise<ChatParticipantResponseDto> {
    const participant = await this.participantRepo.findOne({
      where: { chatId, userId },
      relations: ['chat', 'user'],
    });

    if (!participant) throw new NotFoundException('Participant not found');

    const { joinedAt, user } = participant;
    return {
      chatId,
      userId,
      joinedAt,
      userFirstName: user?.firstName,
      userLastName: user?.lastName,
      userEmail: user?.email,
    };
  }

  async create(data: CreateChatParticipantDto): Promise<ChatParticipantResponseDto> {
    const participant = this.participantRepo.create(data);
    const saved = await this.participantRepo.save(participant);

    const full = await this.participantRepo.findOne({
      where: { chatId: saved.chatId, userId: saved.userId },
      relations: ['chat', 'user'],
    });

    if (!full)
      throw new NotFoundException(
        `Participant (chatId=${saved.chatId}, userId=${saved.userId}) not found after creation.`,
      );

    const { joinedAt, user } = full;
    return {
      chatId: saved.chatId,
      userId: saved.userId,
      joinedAt,
      userFirstName: user?.firstName,
      userLastName: user?.lastName,
      userEmail: user?.email,
    };
  }

  async remove(chatId: number, userId: number): Promise<{ message: string }> {
    const participant = await this.participantRepo.findOne({ where: { chatId, userId } });
    if (!participant) throw new NotFoundException('Participant not found');

    await this.participantRepo.remove(participant);
    return {
      message: `Participant (chatId=${chatId}, userId=${userId}) removed successfully.`,
    };
  }
}
