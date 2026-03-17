import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

@Module({
  imports: [
    // Registra el repositorio de User para poder inyectarlo con @InjectRepository(User).
    TypeOrmModule.forFeature([User]),
  ],
  providers: [UsersService],
  // Exporta UsersService para que otros módulos (AuthModule, un futuro FavoritesModule) puedan usarlo.
  exports: [UsersService],
})
export class UsersModule {}
