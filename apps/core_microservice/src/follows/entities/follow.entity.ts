import { Entity, PrimaryColumn, CreateDateColumn, ManyToOne, JoinColumn, Column } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum FollowStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

@Entity('follows')
export class Follow {
  @PrimaryColumn({ name: 'follower_id', type: 'int' })
    followerId: number;

  @PrimaryColumn({ name: 'followed_id', type: 'int' })
    followedId: number;

  @Column({ type: 'enum', enum: FollowStatus, default: FollowStatus.ACCEPTED })
    status: FollowStatus;

  @Column({ name: 'approved_at', type: 'timestamp', nullable: true })
    approvedAt?: Date;

  @Column({ name: 'rejected_at', type: 'timestamp', nullable: true })
    rejectedAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

  // relations

  @ManyToOne(() => User, (user) => user.following)
  @JoinColumn({ name: 'follower_id' })
    follower: User;

  @ManyToOne(() => User, (user) => user.followers)
  @JoinColumn({ name: 'followed_id' })
    followed: User;
}
