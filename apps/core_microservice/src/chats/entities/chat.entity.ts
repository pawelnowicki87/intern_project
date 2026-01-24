import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToMany,
  Column,
} from 'typeorm';
import { ChatParticipant } from '../../chat-participants/entities/chat-participant.entity';
import { Message } from '../../messages/entities/message.entity';

@Entity('chats')
export class Chat {
  @PrimaryGeneratedColumn()
    id: number;

  @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

  @Column({ name: 'name', type: 'varchar', length: 100, nullable: true })
    name?: string;

  @OneToMany(() => ChatParticipant, (participant) => participant.chat)
    participants: ChatParticipant[];

  @OneToMany(() => Message, (message) => message.chat)
    messages: Message[];
}
