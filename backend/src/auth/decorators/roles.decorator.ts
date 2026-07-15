import { SetMetadata } from '@nestjs/common';
import { Role } from '../../../generated/prisma/client';

// Clé utilisée par le RolesGuard pour lire les métadonnées posées par @Roles(...).
export const ROLES_KEY = 'roles';

// Décorateur : @Roles('ADMIN') restreint une route aux utilisateurs ayant ce(s) rôle(s).
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
