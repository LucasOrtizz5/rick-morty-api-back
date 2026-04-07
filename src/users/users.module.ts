import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { FavoriteEpisode } from '../favorites/entities/favorite-episode.entity';

@Module({
  imports: [
    // Registra el repositorio de User para poder inyectarlo con @InjectRepository(User).
    TypeOrmModule.forFeature([User, FavoriteEpisode]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  // Exporta UsersService para que otros módulos (AuthModule, un futuro FavoritesModule) puedan usarlo.
  exports: [UsersService],
})
export class UsersModule {}
