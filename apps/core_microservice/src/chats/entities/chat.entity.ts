import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { ChatParticipant } from '../../chat-participants/entities/chat-participant.entity';
import { Message } from '../../messages/entities/message.entity';

@Entity('chats')
export class Chat {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => ChatParticipant, (p) => p.chat)
  participants: ChatParticipant[];

  @OneToMany(() => Message, (m) => m.chat)
  messages: Message[];
}
