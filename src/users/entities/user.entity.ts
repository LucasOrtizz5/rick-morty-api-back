import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  OneToMany,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { FavoriteEpisode } from '../../favorites/entities/favorite-episode.entity';
import { EpisodeComment } from '../../comments/entities/episode-comment.entity';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 100 })
  name!: string;

  @Column({ length: 255, unique: true })
  email!: string;

  // La contraseña se hashea mediante @BeforeInsert. Nunca se guarda en texto plano.
  @Column({ length: 255, select: false })
  password!: string;

  @Column({ length: 255 })
  address!: string;

  @Column({ length: 100 })
  city!: string;

  @Column({ length: 100 })
  country!: string;

  @Column({ length: 20 })
  zip!: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role!: UserRole;

  @Column({ type: 'varchar', length: 50, nullable: true })
  nickname?: string | null;

  @Column({ name: 'birth_date', type: 'date', nullable: true })
  birthDate?: string | null;

  @Column({ type: 'varchar', name: 'profile_image_url', length: 500, nullable: true })
  profileImageUrl?: string | null;

  @OneToMany(() => FavoriteEpisode, (favorite) => favorite.user)
  favoriteEpisodes?: FavoriteEpisode[];

  @OneToMany(() => EpisodeComment, (comment) => comment.author)
  comments?: EpisodeComment[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // Hashea automáticamente la contraseña antes de insertar un usuario nuevo en la base de datos.
  @BeforeInsert()
  async hashPassword(): Promise<void> {
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
  }
}
