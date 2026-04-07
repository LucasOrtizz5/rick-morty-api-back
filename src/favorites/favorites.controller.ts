import { Controller, Delete, Get, Param, ParseIntPipe, Post, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { FavoritesService } from './favorites.service';
import { CreateFavoriteDto } from './dto/create-favorite.dto';

@Controller('episodes/favorites')
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  async getMyFavorites(@CurrentUser() user: User) {
    const favorites = await this.favoritesService.getUserFavorites(user.id);

    return {
      header: { resultCode: 0 },
      data: favorites.map((favorite) => this.favoritesService.mapFavorite(favorite)),
    };
  }

  @Post()
  async addFavorite(@CurrentUser() user: User, @Body() dto: CreateFavoriteDto) {
    const favorite = await this.favoritesService.upsertFavorite(user, dto);

    return {
      header: { resultCode: 0 },
      data: this.favoritesService.mapFavorite(favorite),
    };
  }

  @Delete(':episodeId')
  async removeFavorite(
    @CurrentUser() user: User,
    @Param('episodeId', ParseIntPipe) episodeId: number,
  ) {
    await this.favoritesService.removeFavorite(user.id, episodeId);

    return {
      header: { resultCode: 0 },
    };
  }
}
