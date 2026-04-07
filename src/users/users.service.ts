import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { RegisterDto } from '../auth/dto/register.dto';
import { FavoriteEpisode } from '../favorites/entities/favorite-episode.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(FavoriteEpisode)
    private readonly favoritesRepository: Repository<FavoriteEpisode>,
  ) {}

  // Lo usa AuthService durante el registro.
  async create(registerDto: RegisterDto): Promise<User> {
    const existingUser = await this.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('Mail already registered');
    }

    const user = this.usersRepository.create(registerDto);
    return this.usersRepository.save(user);
  }

  // Lo usa JwtStrategy para validar el payload del token.
  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  // Lo usa AuthService durante el login. Selecciona explícitamente 'password'
  // porque la columna tiene select: false en la entidad.
  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();
  }

  // Se usa para validar unicidad del email sin traer la contraseña.
  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<User> {
    const user = await this.findById(userId);

    if (!user) {
      throw new ConflictException('User not found');
    }

    if (dto.nickname !== undefined) {
      user.nickname = dto.nickname.trim() || null;
    }

    if (dto.birthDate !== undefined) {
      user.birthDate = dto.birthDate.trim() || null;
    }

    if (dto.profileImageUrl !== undefined) {
      user.profileImageUrl = dto.profileImageUrl.trim() || null;
    }

    return this.usersRepository.save(user);
  }

  async updateRole(userId: string, role: UserRole): Promise<User> {
    const user = await this.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.role = role;

    return this.usersRepository.save(user);
  }

  async countByRole(role: UserRole): Promise<number> {
    return this.usersRepository.count({ where: { role } });
  }

  async updateRoleByEmail(email: string, role: UserRole): Promise<User> {
    const user = await this.findByEmail(email);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.role = role;

    return this.usersRepository.save(user);
  }

  async findAllWithFavorites() {
    const users = await this.usersRepository.find({
      order: { createdAt: 'DESC' },
    });

    const favorites = await this.favoritesRepository.find({
      order: { createdAt: 'DESC' },
    });

    const favoritesByUser = favorites.reduce<Record<string, FavoriteEpisode[]>>(
      (acc, favorite) => {
        if (!acc[favorite.userId]) {
          acc[favorite.userId] = [];
        }

        acc[favorite.userId].push(favorite);
        return acc;
      },
      {},
    );

    return users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      nickname: user.nickname ?? undefined,
      birthDate: user.birthDate ?? undefined,
      profileImageUrl: user.profileImageUrl ?? undefined,
      favorites: (favoritesByUser[user.id] ?? []).map((favorite) => ({
        id: favorite.episodeId,
        name: favorite.name,
        episode: favorite.episodeCode,
        air_date: favorite.airDate,
      })),
    }));
  }
}
