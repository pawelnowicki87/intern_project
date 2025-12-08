import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatParticipant } from './entities/chat-participant.entity';
import { ChatParticipantsService } from './chat-participants.service';
import { ChatParticipantsController } from './chat-participants.controller';
import { ChatParticipantsRepository } from './chat-participants.repository';
import { ChatParticipantsWebsocketAdapter } from './adapters/chat-participants.websocket.adapter';
import { CHAT_PARTICIPANTS_WEBSOCKET } from 'src/websecket/ports/chat-participant-websocket.port';

@Module({
  imports: [TypeOrmModule.forFeature([ChatParticipant])],
  controllers: [ChatParticipantsController],
  providers: [
    ChatParticipantsService, 
    ChatParticipantsRepository,
    {
      provide: CHAT_PARTICIPANTS_WEBSOCKET,
      useClass: ChatParticipantsWebsocketAdapter
    }
  ],
  exports: [
    ChatParticipantsService, 
    ChatParticipantsRepository,
    CHAT_PARTICIPANTS_WEBSOCKET
  ],
})
export class ChatParticipantsModule {}
