import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Protège la route /auth/refresh avec la stratégie 'refresh-jwt'.
// Le token est lu depuis le cookie HttpOnly, pas depuis l'en-tête Authorization.
@Injectable()
export class RefreshAuthGuard extends AuthGuard('refresh-jwt') {}
