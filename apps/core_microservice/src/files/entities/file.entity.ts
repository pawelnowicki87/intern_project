import { User } from 'src/users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('files')
export class File {
  @PrimaryGeneratedColumn()
    id: number;

  @Column({ type: 'varchar', nullable: false })
    url: string;

  @Column({ name: 'public_id', type: 'varchar', nullable: false })
    publicId: string;

  @Column({ name: 'type', type: 'varchar', nullable: true })
    fileType?: string;

  @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

  @ManyToOne(() => User, (user) => user.files, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'owner_id' })
    owner: User;
}
