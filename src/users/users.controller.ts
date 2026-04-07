import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User, UserRole } from './entities/user.entity';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch('profile')
  async updateProfile(@CurrentUser() user: User, @Body() dto: UpdateProfileDto) {
    const updatedUser = await this.usersService.updateProfile(user.id, dto);

    return {
      header: { resultCode: 0 },
      data: updatedUser,
    };
  }

  @Get('admin/favorites')
  async listUsersWithFavorites(@CurrentUser() user: User) {
    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can access this resource');
    }

    const users = await this.usersService.findAllWithFavorites();

    return {
      header: { resultCode: 0 },
      data: users,
    };
  }

  @Patch('admin/:userId/role')
  async updateUserRole(
    @CurrentUser() currentUser: User,
    @Param('userId') userId: string,
    @Body() dto: UpdateUserRoleDto,
  ) {
    if (currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can update user roles');
    }

    if (currentUser.id === userId && dto.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Admins cannot remove their own admin role');
    }

    const updatedUser = await this.usersService.updateRole(userId, dto.role);

    return {
      header: { resultCode: 0 },
      data: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    };
  }
}
