import { IsEmail, IsString, MinLength, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../../generated/prisma/client';

// DTO réservé aux administrateurs : contrairement à RegisterDto (inscription publique),
// il permet de choisir explicitement le rôle du nouvel utilisateur, y compris ADMIN.
export class CreateUserDto {
  @ApiProperty({
    example: 'newadmin@example.com',
    description: 'Adresse email unique',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'Mot de passe (min. 8 caractères)',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'John', description: 'Prénom' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'Nom de famille' })
  @IsString()
  lastName: string;

  @ApiProperty({
    example: 'Acme Corp',
    description: "Nom de l'entreprise",
  })
  @IsString()
  nameCorporate: string;

  @ApiProperty({
    example: 'ADMIN',
    enum: Role,
    description:
      'Rôle du nouvel utilisateur (USER ou ADMIN). Réservé aux administrateurs.',
  })
  @IsEnum(Role)
  role: Role;
}
