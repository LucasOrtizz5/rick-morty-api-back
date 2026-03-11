import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { Request } from 'express';
import { UsersService } from '../../users/users.service';
import { User } from '../../users/entities/user.entity';

export interface JwtPayload {
  sub: string; // user UUID
  email: string;
  role: string;
}

function extractAccessToken(req: Request | undefined): string | null {
  const cookies = req?.cookies as unknown;

  if (typeof cookies !== 'object' || cookies === null) {
    return null;
  }

  const accessToken = (cookies as Record<string, unknown>).access_token;
  return typeof accessToken === 'string' ? accessToken : null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      // Extract JWT from the httpOnly cookie named 'access_token'
      jwtFromRequest: ExtractJwt.fromExtractors([extractAccessToken]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET')!,
    });
  }

  // Called automatically by Passport after verifying the token signature.
  // The return value is attached to req.user.
  async validate(payload: JwtPayload): Promise<User> {
    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }
    return user;
  }
}
