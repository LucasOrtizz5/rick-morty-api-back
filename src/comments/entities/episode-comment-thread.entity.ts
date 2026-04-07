import { Column, Entity, PrimaryColumn } from 'typeorm';
import { UserRole } from '../../users/entities/user.entity';

@Entity('episode_comment_threads')
export class EpisodeCommentThread {
  @PrimaryColumn({ name: 'episode_id', type: 'int' })
  episodeId!: number;

  @Column({ name: 'comments_locked', type: 'boolean', default: false })
  commentsLocked!: boolean;

  @Column({ name: 'locked_by_user_id', type: 'uuid', nullable: true })
  lockedByUserId?: string | null;

  @Column({ name: 'locked_by_user_name', type: 'varchar', length: 100, nullable: true })
  lockedByUserName?: string | null;

  @Column({ name: 'locked_by_user_role', type: 'enum', enum: UserRole, nullable: true })
  lockedByUserRole?: UserRole | null;

  @Column({ name: 'locked_at', type: 'timestamptz', nullable: true })
  lockedAt?: Date | null;
}
