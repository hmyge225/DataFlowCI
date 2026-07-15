import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

// Cette stratégie lit le refresh_token depuis un cookie HttpOnly.
// Comme il est HttpOnly, JavaScript du navigateur ne peut pas le lire
// → protection contre le vol de token via XSS (scripts malveillants).
interface JwtPayload {
  sub: string;
  email: string;
}

// Fonction qui extrait le token depuis le cookie nommé 'refresh_token'.
const cookieExtractor = (req: Request): string | null => {
  // req.cookies est disponible grâce à cookie-parser (dans main.ts).
  const token = req.cookies?.refresh_token;
  return token || null;
};

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'refresh-jwt',
) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: cookieExtractor,
      secretOrKey: process.env.JWT_REFRESH_SECRET!,
      // On passe la requête entière à validate() pour pouvoir lire le token brut
      passReqToCallback: true,
    });
  }

  // validate reçoit (req, payload) car passReqToCallback = true.
  async validate(req: Request, payload: JwtPayload) {
    const token = req.cookies?.refresh_token as string;

    if (!token) {
      throw new UnauthorizedException('Refresh token missing');
    }

    // On vérifie que le token existe en base et n'est pas expiré.
    const stored = await this.prisma.refreshToken.findFirst({
      where: {
        userId: payload.sub,
        expiresAt: { gt: new Date() },
      },
    });

    if (!stored) {
      throw new UnauthorizedException('Refresh token invalid or expired');
    }

    // Vérification du hash : on compare le token brut avec le hash stocké.
    const bcrypt = await import('bcrypt');
    const match = await bcrypt.compare(token, stored.tokenHash);

    if (!match) {
      throw new UnauthorizedException('Refresh token invalid');
    }

    // On retourne l'userId pour que la route /refresh puisse générer un nouveau token.
    return { userId: payload.sub, tokenId: stored.id };
  }
}
