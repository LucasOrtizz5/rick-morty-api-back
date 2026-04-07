import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { FavoriteEpisode } from './entities/favorite-episode.entity';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(FavoriteEpisode)
    private readonly favoritesRepository: Repository<FavoriteEpisode>,
  ) {}

  async getUserFavorites(userId: string): Promise<FavoriteEpisode[]> {
    return this.favoritesRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async upsertFavorite(user: User, dto: CreateFavoriteDto): Promise<FavoriteEpisode> {
    const existingFavorite = await this.favoritesRepository.findOne({
      where: { userId: user.id, episodeId: dto.id },
    });

    if (existingFavorite) {
      return existingFavorite;
    }

    const favorite = this.favoritesRepository.create({
      userId: user.id,
      episodeId: dto.id,
      name: dto.name.trim(),
      episodeCode: dto.episode.trim(),
      airDate: dto.air_date.trim(),
    });

    return this.favoritesRepository.save(favorite);
  }

  async removeFavorite(userId: string, episodeId: number): Promise<void> {
    await this.favoritesRepository.delete({ userId, episodeId });
  }

  mapFavorite(favorite: FavoriteEpisode) {
    return {
      id: favorite.episodeId,
      name: favorite.name,
      episode: favorite.episodeCode,
      air_date: favorite.airDate,
    };
  }
}
