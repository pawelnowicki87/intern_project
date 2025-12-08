export const MESSAGE_READ_WEBSOCKET = Symbol('MESSAGE_READ_WEBSOCKET');

export interface IMessageReadWebsocketReader {
  markMessageAsRead(messageId: number): Promise<void>;
}
