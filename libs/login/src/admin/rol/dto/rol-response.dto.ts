import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class RolResponseDto {
  @ApiProperty({
    description: 'ID del rol',
    type: String,
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description: 'Nombre del rol',
    type: String,
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Descripción del rol',
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}
