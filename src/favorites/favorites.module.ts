import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FavoriteEpisode } from './entities/favorite-episode.entity';
import { FavoritesController } from './favorites.controller';
import { FavoritesService } from './favorites.service';

@Module({
  imports: [TypeOrmModule.forFeature([FavoriteEpisode])],
  controllers: [FavoritesController],
  providers: [FavoritesService],
  exports: [FavoritesService, TypeOrmModule],
})
export class FavoritesModule {}
