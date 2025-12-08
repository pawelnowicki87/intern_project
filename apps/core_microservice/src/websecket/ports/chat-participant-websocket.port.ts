export const CHAT_PARTICIPANTS_WEBSOCKET = Symbol('CHAT_PARTICIPANTS_WEBSOCKET');

export interface IChatParticipantsWebsocketReader {
    isUserInChat(chatId: number, userId: number): Promise<boolean>;
}