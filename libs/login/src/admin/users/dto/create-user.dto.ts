import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsMobilePhone,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'Nombre del usuario',
    example: 'John Doe',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.trim().toLowerCase())
  name: string;

  @ApiProperty({
    description: 'Correo electrónico del usuario',
    example: 'lW3T9@example.com',
    type: String,
  })
  @IsEmail()
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  email: string;

  @ApiProperty({
    description: 'Contraseña del usuario',
    example: 'P@ssw0rd',
    type: String,
    minLength: 6,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(50)
  @Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'the password is too weak, it must contain at least one uppercase letter, one lowercase letter, one number',
  })
  @Transform(({ value }) => value.trim())
  password: string;

  @ApiProperty({
    description: 'Número de teléfono del usuario',
    example: '+51999999999',
    required: false,
  })
  @IsString()
  @IsMobilePhone()
  @Transform(({ value }) => value.trim())
  phone?: string;

  @ApiProperty({
    description: 'Ids de roles del usuario',
    example: ['a5ece059-6d13-4c47-94e4-446e6bf6d0e4'],
  })
  @IsArray()
  @IsNotEmpty()
  roles: string[];
}
