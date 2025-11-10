import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatParticipant } from './entities/chat-participant.entity';
import { ChatParticipantsService } from './chat-participants.service';
import { ChatParticipantsController } from './chat-participants.controller';
import { ChatParticipantsRepository } from './chat-participants.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ChatParticipant])],
  controllers: [ChatParticipantsController],
  providers: [ChatParticipantsService, ChatParticipantsRepository],
  exports: [ChatParticipantsService, ChatParticipantsRepository],
})
export class ChatParticipantsModule {}
