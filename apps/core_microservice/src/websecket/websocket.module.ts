import { Module } from '@nestjs/common';
import { WebsocketGateway } from './websocket.gateway';
import { MessagesModule } from 'src/messages/messages.module';
import { ChatParticipantsModule } from 'src/chat-participants/chat-participants.module';

@Module({
  imports: [
    MessagesModule,
    ChatParticipantsModule
  ],
  providers: [WebsocketGateway],
  exports: [WebsocketGateway],
})
export class WebsocketModule {}
