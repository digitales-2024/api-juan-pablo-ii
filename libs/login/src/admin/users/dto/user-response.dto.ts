import { ApiProperty } from '@nestjs/swagger';
import { UserProfileResponseDto } from './user-profile-reponse.dto';
import { IsBoolean, IsString } from 'class-validator';

export class UserResponseDto extends UserProfileResponseDto {
  @ApiProperty({
    description: 'El usuario está activa',
    example: true,
    type: Boolean,
  })
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({
    description: 'El usuario debe cambiar la contraseña',
    example: true,
    type: Boolean,
  })
  @IsBoolean()
  mustChangePassword: boolean;

  @ApiProperty({
    description: 'Última vez que el usuario hizo login',
    example: '2021-01-01',
    type: Date,
  })
  @IsString()
  lastLogin: Date;
}
