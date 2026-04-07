import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import databaseConfig from './config/database.config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { FavoritesModule } from './favorites/favorites.module';
import { CommentsModule } from './comments/comments.module';


@Module({
  imports: [
    // Hace que las variables de .env estén disponibles en toda la app mediante ConfigService.
    // isGlobal: true evita tener que reimportar ConfigModule en cada módulo.
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
      envFilePath: '.env',
    }),

    // TypeORM toma su configuración del namespace 'database' registrado arriba.
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => config.get('database')!,
    }),
    UsersModule,
    AuthModule,
    FavoritesModule,
    CommentsModule,
  ],
})
export class AppModule {}
