import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { IMessageWebsocketReader, MESSAGE_WEBSOCKET_READER } from './ports/message-websocket.port';
import { Inject, UseGuards } from '@nestjs/common';
import { WsJwtGuard } from './guards/ws-jwt.guard';
import { CHAT_PARTICIPANTS_WEBSOCKET, IChatParticipantsWebsocketReader } from './ports/chat-participant-websocket.port';
import { IMessageReadWebsocketReader, MESSAGE_READ_WEBSOCKET } from './ports/message-read-websocket.port';

@WebSocketGateway({
  cors: { origin: '*' },
})
@UseGuards(WsJwtGuard)
export class WebsocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    @Inject(MESSAGE_WEBSOCKET_READER)
    private readonly messageAdapter: IMessageWebsocketReader,

    @Inject(CHAT_PARTICIPANTS_WEBSOCKET)
    private readonly chatParticioantsReader: IChatParticipantsWebsocketReader,

    @Inject(MESSAGE_READ_WEBSOCKET)
    private readonly messageReadAdapter: IMessageReadWebsocketReader,
  ) {}

  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log('Client connected:', client.id);
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id);
  }

  @SubscribeMessage('ping_test')
  handlePing(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    client.emit('pong_test', { message: 'pong!', received: data });
  }

  @SubscribeMessage('join_room')
  async handleJoinRoom(
    @MessageBody() body: { chatId: number },
    @ConnectedSocket() client: Socket
  ) {
    const userId = client.data.userId;

    const canJoin = await this.chatParticioantsReader.isUserInChat(body.chatId, userId);

    if (!canJoin) {
      return { error: 'You are not a participant of this chat.' };
    }

    const roomName = `chat_${body.chatId}`;
    client.join(roomName);

    return { joined: true, room: roomName };
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @MessageBody() body: { chatId: number; receiverId: number; text: string },
    @ConnectedSocket() client: Socket
  ) {
    const userId = client.data.userId;

    const allowed = await this.chatParticioantsReader.isUserInChat(body.chatId, userId);

    if (!allowed) {
      return { error: 'You cannot send messages to this chat.' };
    }

    const roomName = `chat_${body.chatId}`;
    const senderId = client.data.userId;

    const saved = await this.messageAdapter.saveMessageToDb({
      chatId: body.chatId,
      senderId,
      receiverId: body.receiverId,
      body: body.text,
    });

    this.server.to(roomName).emit('new_message', saved);

    return { delivered: true };
  }

  @SubscribeMessage('message_read')
  async handleMessageRead(
    @MessageBody() body: { messageId: number; chatId: number },
    @ConnectedSocket() client: Socket
  ) {
    const userId = client.data.userId;

    const isAllowed = await this.chatParticioantsReader.isUserInChat(body.chatId, userId);

    if (!isAllowed) {
      return { error: 'Not allowed' };
    }

    await this.messageReadAdapter.markMessageAsRead(body.messageId);

    const room = `chat_${body.chatId}`;
    this.server.to(room).emit('message_read_broadcast', {
      messageId: body.messageId,
      userId,
    });

    return { ok: true };
  }

  @SubscribeMessage('typing')
  async handleTyping(
    @MessageBody() body: { chatId: number },
    @ConnectedSocket() client: Socket
  ) {
    const userId = client.data.userId;

    const allowed = await this.chatParticioantsReader.isUserInChat(body.chatId, userId);
    if (!allowed) return;

    const room = `chat_${body.chatId}`;
    this.server.to(room).emit('user_typing', { userId });
  }

  @SubscribeMessage('stop_typing')
  async handleStopTyping(
    @MessageBody() body: { chatId: number },
    @ConnectedSocket() client: Socket
  ) {
    const userId = client.data.userId;

    const allowed = await this.chatParticioantsReader.isUserInChat(body.chatId, userId);
    if (!allowed) return;

    const room = `chat_${body.chatId}`;
    this.server.to(room).emit('user_stop_typing', { userId });
  }
}
