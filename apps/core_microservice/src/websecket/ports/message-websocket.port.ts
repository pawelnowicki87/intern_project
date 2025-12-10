import { MessageResponseDto } from 'src/messages/dto/message-response.dto';

export const MESSAGE_WEBSOCKET_READER = Symbol('MESSAGE_WEBSOCKET_READER');

export interface IMessageWebsocketReader {
    saveMessageToDb(data: {
        chatId: number;
        senderId: number;
        receiverId: number;
        body: string;
    }): Promise<MessageResponseDto>;

    editMessage(id: number, body: string): Promise<MessageResponseDto>;

    deleteMessage(id: number): Promise<boolean>;
}
