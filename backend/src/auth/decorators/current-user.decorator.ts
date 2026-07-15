import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

// User injecté par JwtStrategy.validate() dans request.
export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: string;
}

type RequestWithUser = Request & { user?: AuthenticatedUser };

// Décorateur : @CurrentUser() extrait l'utilisateur authentifié du request.
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthenticatedUser => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user) {
      throw new Error(
        'CurrentUser doit être utilisé sur une route protégée par JwtAuthGuard',
      );
    }

    return user;
  },
);
