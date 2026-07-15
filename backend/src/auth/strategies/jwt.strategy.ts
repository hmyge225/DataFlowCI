import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

// Ce payload est ce que le JWT contient (on l'a signé dans AuthService).
// sub = subject = l'ID de l'utilisateur.
interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

// La stratégie JWT vérifie le token d'accès (access_token).
// Passport va lire l'en-tête Authorization: Bearer <token>,
// vérifier la signature avec JWT_SECRET, et retourner le payload.
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private prisma: PrismaService) {
    super({
      // On extrait le token depuis l'en-tête Authorization
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // Clé secrète pour vérifier la signature (doit correspondre à celle utilisée pour signer)
      secretOrKey: process.env.JWT_SECRET!,
    });
  }

  // Cette méthode est appelée APRÈS que Passport ait vérifié la signature.
  // 'payload' contient ce qu'on a mis dans le token (sub, email, role).
  // On retourne un objet qui sera attaché à request.user dans les controllers.
  async validate(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // On ne renvoie jamais le password, même hashé.
    return {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
  }
}
