import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// DTO = Data Transfer Object. C'est une classe qui définit la "forme" des données
// que le client doit envoyer. class-validator vérifie automatiquement les règles.
export class RegisterDto {
  @ApiProperty({
    example: 'user@example.com',
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
}
