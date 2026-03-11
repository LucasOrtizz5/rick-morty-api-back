import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

@Module({
  imports: [
    // Registers the User repository so it can be injected with @InjectRepository(User)
    TypeOrmModule.forFeature([User]),
  ],
  providers: [UsersService],
  // Export UsersService so other modules (AuthModule, future FavoritesModule) can use it
  exports: [UsersService],
})
export class UsersModule {}
