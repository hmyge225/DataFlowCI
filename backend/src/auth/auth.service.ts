import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto } from './dto';
import * as bcrypt from 'bcrypt';

// Ce service contient TOUTE la logique métier de l'authentification.
// Il est injecté dans le controller. C'est le pattern "thin controller, fat service".
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const UserExisting = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (UserExisting) {
      throw new ConflictException("L'adresse email est déjà utilisée");
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(dto.password, saltRounds);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        firstName: dto.firstName,
        lastName: dto.lastName,
        nameCorporate: dto.nameCorporate ?? null,
        role: dto.role ?? 'USER',
      },
    });

    // On ne renvoie jamais le mot de passe, même hashé.
    return {
      message: 'Utilisateur créé avec succès',
      userId: user.id,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    const match = await bcrypt.compare(dto.password, user.password);
    if (!match) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    // On stocke le hash du refresh token en base, pas le token brut.
    // Si la base est compromise, l'attaquant n'a pas le token brut (il faut le hash).
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  // --- REFRESH ---
  // Génère un nouveau couple access_token + refresh_token.
  // L'ancien refresh token est supprimé et remplacé par le nouveau (rotation des tokens).
  async refresh(userId: string, oldTokenId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Supprime l'ancien refresh token (rotation)
    await this.prisma.refreshToken.delete({ where: { id: oldTokenId } });

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  // Supprime le refresh token de la base. Même si l'access token est encore valide
  async logout(userId: string, refreshToken: string) {
    const tokens = await this.prisma.refreshToken.findMany({
      where: { userId },
    });

    // On compare le hash pour trouver le bon token à supprimer.
    for (const token of tokens) {
      const match = await bcrypt.compare(refreshToken, token.tokenHash);
      if (match) {
        await this.prisma.refreshToken.delete({ where: { id: token.id } });
        break;
      }
    }

    return { message: 'Déconnexion réussie' };
  }

  // --- HELPERS ---

  // Génère les deux tokens JWT. Le payload minimal (sub = userId, email, role).
  private async generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };

    // Access token : court (15 min), utilisé pour chaque requête API.
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '15m',
    });

    // Refresh token : long (7 jours), utilisé uniquement pour obtenir un nouvel access token.
    // On l'envoie dans un cookie HttpOnly pour le protéger du XSS.
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }

  // Stocke le hash du refresh token en base avec une date d'expiration.
  private async storeRefreshToken(userId: string, token: string) {
    const tokenHash = await bcrypt.hash(token, 10);

    // 7 jours en millisecondes
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await this.prisma.refreshToken.create({
      data: {
        tokenHash,
        userId,
        expiresAt,
      },
    });
  }
}
