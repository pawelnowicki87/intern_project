import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('user_credentials')
export class UserCredentials {
  @PrimaryGeneratedColumn()
    id: number;

  @Column({ name: 'password_hash', type: 'varchar', nullable: true })
    passwordHash?: string;

  @Column({ name: 'refreshtoken_hash', type: 'varchar', nullable: true })
    refreshTokenHash?: string;

  @CreateDateColumn({ name: 'created_at'})
    createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at'})
    updatedAt: Date;

  @OneToOne(() => User, (user) => user.credentials, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
    user: User;
}
