import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('favorite_episodes')
@Unique(['userId', 'episodeId'])
export class FavoriteEpisode {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'episode_id', type: 'int' })
  episodeId!: number;

  @Column({ length: 255 })
  name!: string;

  @Column({ name: 'episode_code', length: 20 })
  episodeCode!: string;

  @Column({ name: 'air_date', length: 80 })
  airDate!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @ManyToOne(() => User, (user) => user.favoriteEpisodes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
