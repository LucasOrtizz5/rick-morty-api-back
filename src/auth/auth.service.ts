import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '../users/entities/user.entity';
import { JwtPayload } from './strategies/jwt.strategy';

type AuthUserResponse = Pick<
  User,
  | 'id'
  | 'name'
  | 'email'
  | 'address'
  | 'city'
  | 'country'
  | 'zip'
  | 'role'
  | 'createdAt'
  | 'updatedAt'
>;

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthUserResponse> {
    // UsersService.create handles duplicate email check and bcrypt hashing via @BeforeInsert
    const user = await this.usersService.create(registerDto);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      address: user.address,
      city: user.city,
      country: user.country,
      zip: user.zip,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async login(loginDto: LoginDto): Promise<{ accessToken: string }> {
    // Fetch user WITH password (the column has select: false, so we use the special method)
    const user = await this.usersService.findByEmailWithPassword(
      loginDto.email,
    );

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);
    return { accessToken };
  }
}
