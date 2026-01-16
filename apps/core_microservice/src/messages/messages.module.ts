import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { MessagesRepository } from './messages.repository';
import { MessageWebsocketAdapter } from './adapters/message-websocket.adapter';
import { MESSAGE_READ_WEBSOCKET } from 'src/websecket/ports/message-read-websocket.port';
import { MESSAGE_WEBSOCKET_READER } from 'src/websecket/ports/message-websocket.port';
import { MessageReadWebsocketAdapter } from './adapters/message-read-websocket.adapter';

@Module({
  imports: [TypeOrmModule.forFeature([Message])],
  controllers: [MessagesController],
  providers: [
    MessagesService,
    MessagesRepository,

    MessageWebsocketAdapter,
    MessageReadWebsocketAdapter,

    {
      provide: MESSAGE_WEBSOCKET_READER,
      useExisting: MessageWebsocketAdapter,
    },
    {
      provide: MESSAGE_READ_WEBSOCKET,
      useExisting: MessageReadWebsocketAdapter,
    },
  ],
  exports: [
    MessagesService,
    MessagesRepository,
    MESSAGE_WEBSOCKET_READER,
    MESSAGE_READ_WEBSOCKET,
  ],
})
export class MessagesModule {}

