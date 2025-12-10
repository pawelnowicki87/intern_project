import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('profile_to_profile_configurations')
export class ProfileToProfileConfiguration {
  @PrimaryColumn({ name: 'source_user_id', type: 'int' })
    sourceUserId: number;

  @PrimaryColumn({ name: 'target_user_id', type: 'int' })
    targetUserId: number;

  @Column({ name: 'is_blocked', type: 'boolean', default: false })
    isBlocked: boolean;

  @Column({ name: 'is_muted', type: 'boolean', default: false })
    isMuted: boolean;

  @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'source_user_id' })
    sourceUser: User;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'target_user_id' })
    targetUser: User;
}
