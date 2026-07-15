import {
  Controller,
  Post,
  Body,
  Get,
  Req,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, CreateUserDto } from './dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RefreshAuthGuard } from './guards/refresh-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';

// Controller = point d'entrée HTTP. Il reçoit les requêtes et appelle le service.
@ApiTags('auth') // Regroupe les endpoints
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Inscription',
    description: 'Crée un nouvel utilisateur avec un mot de passe hashé.',
  })
  @ApiBody({ type: RegisterDto })
  @ApiCreatedResponse({ description: 'Utilisateur créé avec succès.' })
  @ApiConflictResponse({ description: 'Email déjà utilisé.' })
  @ApiBadRequestResponse({
    description:
      'Données invalides (email mal formaté, mot de passe trop court, etc.).',
  })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  // POST /auth/login
  // Vérifie les identifiants, génère les tokens.
  // Le refresh_token est envoyé dans un cookie HttpOnly (pas accessible au JS).
  // L'access_token est renvoyé en JSON pour être utilisé dans l'en-tête Authorization.
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Connexion',
    description:
      'Vérifie email + mot de passe. Renvoie un access_token en JSON et pose un cookie HttpOnly refresh_token.',
  })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({
    description:
      "Connexion réussie. L'access_token est dans le corps, le refresh_token est dans un cookie HttpOnly.",
  })
  @ApiUnauthorizedResponse({ description: 'Email ou mot de passe incorrect.' })
  @ApiBadRequestResponse({ description: 'Données invalides.' })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.login(dto);

    // Cookie HttpOnly : le navigateur l'envoie automatiquement sur chaque requête
    // vers le même domaine, mais JavaScript ne peut pas le lire.
    // sameSite: 'strict' protège contre les attaques CSRF.
    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: false, // mettre true en production (HTTPS)
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours en millisecondes
    });

    return {
      access_token: tokens.accessToken,
    };
  }

  // POST /auth/refresh
  // Protégé par RefreshAuthGuard : lit le refresh_token depuis le cookie.
  // Génère un nouveau couple access_token + refresh_token (rotation).
  @Post('refresh')
  @UseGuards(RefreshAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Rafraîchir les tokens',
    description:
      'Lit le refresh_token depuis le cookie HttpOnly, le valide en base, puis génère un nouveau couple access_token + refresh_token (rotation). Le nouveau refresh_token est posé en cookie.',
  })
  @ApiOkResponse({
    description:
      'Nouveaux tokens générés. Le cookie refresh_token est mis à jour.',
  })
  @ApiUnauthorizedResponse({
    description: 'Refresh token invalide, expiré ou révoqué.',
  })
  async refresh(
    @Req() req: Request & { user: { userId: string; tokenId: string } },
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.refresh(
      req.user.userId,
      req.user.tokenId,
    );

    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      access_token: tokens.accessToken,
    };
  }

  // POST /auth/logout
  // Protégé par JwtAuthGuard : l'utilisateur doit être authentifié.
  // Supprime le refresh token de la base et efface le cookie.
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth() // Indique à Swagger que cette route nécessite un access_token Bearer
  @ApiOperation({
    summary: 'Déconnexion',
    description:
      "Supprime le refresh token de la base de données et efface le cookie. L'access_token reste valide jusqu'à son expiration (15 min).",
  })
  @ApiOkResponse({ description: 'Déconnexion réussie.' })
  @ApiUnauthorizedResponse({
    description: 'Access token manquant ou invalide.',
  })
  async logout(
    @Req() req: Request & { user: { userId: string } },
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.refresh_token as string;
    await this.authService.logout(req.user.userId, refreshToken);

    res.clearCookie('refresh_token');
    return { message: 'Déconnexion réussie' };
  }

  // GET /auth/me
  // Retourne les infos de l'utilisateur connecté (via l'access token).
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth() // Swagger : cliquez sur "Authorize" et entrez le Bearer token
  @ApiOperation({
    summary: 'Profil utilisateur',
    description:
      "Retourne les claims du JWT (userId, email, role) de l'utilisateur connecté.",
  })
  @ApiOkResponse({ description: 'Infos utilisateur.' })
  @ApiUnauthorizedResponse({
    description: 'Access token manquant ou invalide.',
  })
  me(
    @Req()
    req: Request & { user: { userId: string; email: string; role: string } },
  ) {
    return req.user;
  }

  // POST /auth/users
  // Réservé aux ADMIN (JwtAuthGuard vérifie l'authentification, RolesGuard vérifie le rôle).
  // Contrairement à /auth/register, permet de choisir le rôle du nouvel utilisateur (y compris ADMIN).
  @Post('users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Créer un utilisateur (admin)',
    description:
      "Réservé aux administrateurs. Permet de créer un utilisateur avec n'importe quel rôle, y compris ADMIN.",
  })
  @ApiBody({ type: CreateUserDto })
  @ApiCreatedResponse({ description: 'Utilisateur créé avec succès.' })
  @ApiConflictResponse({ description: 'Email déjà utilisé.' })
  @ApiUnauthorizedResponse({
    description: 'Access token manquant ou invalide.',
  })
  @ApiBadRequestResponse({ description: 'Données invalides.' })
  async createUser(
    @Body() dto: CreateUserDto,
    @Req() req: Request & { user: { userId: string } },
  ) {
    return this.authService.createUserByAdmin(dto, req.user.userId);
  }
}
