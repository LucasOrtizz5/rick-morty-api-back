import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Guard abreviado que ejecuta la estrategia 'jwt' de Passport.
// Úsalo en cualquier ruta que requiera autenticación:
//   @UseGuards(JwtAuthGuard)
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
