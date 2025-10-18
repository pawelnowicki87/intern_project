import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatParticipantsService } from './chat-participants.service';
import { ChatParticipantsController } from './chat-participants.controller';
import { ChatParticipant } from './entities/chat-participant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ChatParticipant])],
  controllers: [ChatParticipantsController],
  providers: [ChatParticipantsService],
})
export class ChatParticipantsModule {}
