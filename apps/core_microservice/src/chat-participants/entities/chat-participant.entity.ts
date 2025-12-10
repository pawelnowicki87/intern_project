import { Entity, PrimaryColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Chat } from '../../chats/entities/chat.entity';
import { User } from '../../users/entities/user.entity';

@Entity('chat_participants')
export class ChatParticipant {
  @PrimaryColumn({ name: 'chat_id', type: 'int' })
    chatId: number;

  @PrimaryColumn({ name: 'user_id', type: 'int' })
    userId: number;

  @CreateDateColumn({ name: 'joined_at' })
    joinedAt: Date;

  @ManyToOne(() => Chat, (chat) => chat.participants, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'chat_id' })
    chat: Chat;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
    user: User;
}
