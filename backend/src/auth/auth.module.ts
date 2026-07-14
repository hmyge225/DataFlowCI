import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RefreshTokenStrategy } from './strategies/refresh-token.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RefreshAuthGuard } from './guards/refresh-auth.guard';

// AuthModule regroupe tout ce qui concerne l'authentification.
// JwtModule : signe et vérifie les tokens JWT.
// PassportModule : fournit les Guards et Strategies.
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({}),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    // Strategies d'authentification
    JwtStrategy,
    RefreshTokenStrategy,
    // Guards pour protéger les routes
    JwtAuthGuard,
    RefreshAuthGuard,
  ],
  exports: [JwtAuthGuard],
})
export class AuthModule {}
