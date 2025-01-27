// dto/create-calendar.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsUUID } from 'class-validator';

// CreateCalendarDto

export class CreateCalendarDto {
  @ApiProperty({
    description: 'ID del personal asociado al calendario',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  personalId: string;

  @ApiProperty({
    description: 'ID de la sucursal asociada al calendario',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  sucursalId: string;

  @ApiProperty({
    description: 'Nombre del calendario',
    example: 'Horario Normal',
  })
  @IsString()
  nombre: string;

  @ApiProperty({
    description: 'Color del calendario',
    example: '#FF0000',
    required: false,
  })
  @IsString()
  @IsOptional()
  color?: string;

  @ApiProperty({
    description: 'Indica si es el calendario predeterminado',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  isDefault: boolean;
}
