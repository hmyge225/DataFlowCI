import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ValidationPipe global : valide automatiquement les DTOs (class-validator).
  // whitelist: true = supprime les champs non définis dans le DTO (sécurité).
  // forbidNonWhitelisted: true = rejette la requête si des champs inconnus sont envoyés.
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );

  // Configuration de Swagger
  const config = new DocumentBuilder()
    .setTitle('DataFlowCI API')
    .setDescription('API pour la gestion des flux de données')
    .setVersion('1.0')
    .addBearerAuth() // Active le bouton "Authorize" dans Swagger UI pour les tokens JWT
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  // cookie-parser lit les cookies de la requête et les met dans req.cookies.
  // C'est indispensable pour que la stratégie refresh-jwt puisse lire le cookie HttpOnly.
  app.use(cookieParser());

  // CORS : autorise le frontend (Vite) à appeler l'API.
  // credentials: true permet d'envoyer les cookies HttpOnly avec les requêtes cross-origin.
  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
