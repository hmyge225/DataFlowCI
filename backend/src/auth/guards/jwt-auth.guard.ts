import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Guard = garde-fou. Il protège une route.
// JwtAuthGuard utilise la stratégie 'jwt' définie dans JwtStrategy.
// Si le token est valide, la route s'exécute. Sinon, renvoie 401.
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
