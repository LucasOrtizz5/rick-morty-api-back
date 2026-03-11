import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Shorthand guard that triggers the 'jwt' Passport strategy.
// Apply this to any route that requires authentication:
//   @UseGuards(JwtAuthGuard)
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
