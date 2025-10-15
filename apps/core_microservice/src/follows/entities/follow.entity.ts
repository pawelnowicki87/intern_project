import {
  Entity,
  PrimaryColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('follows')
export class Follow {
  @PrimaryColumn({ name: 'follower_id', type: 'int' })
  followerId: number;

  @PrimaryColumn({ name: 'followed_id', type: 'int' })
  followedId: number;

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
