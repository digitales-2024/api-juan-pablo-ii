import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, IsNotEmpty, IsDate, IsOptional } from 'class-validator';

/**
 * DTO para la creación de ausencias temporales
 * @class CreateTimeOffDto
 */
export class CreateTimeOffDto {
  @ApiProperty({
    description: 'ID del personal asociado',
    example: 'uuid-del-personal',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  staffId: string;

  @ApiProperty({
    description: 'ID de la sucursal asociada',
    example: 'uuid-de-la-sucursal',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  branchId: string;

  @ApiProperty({
    description: 'Fecha y hora de inicio de la ausencia',
    example: '2023-11-20T00:00:00Z',
    required: true,
  })
  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  start: Date;

  @ApiProperty({
    description: 'Fecha y hora de fin de la ausencia',
    example: '2023-11-25T23:59:00Z',
    required: true,
  })
  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  end: Date;

  @ApiProperty({
    description: 'Motivo de la ausencia (opcional)',
    example: 'Vacaciones',
    required: false,
  })
  @IsString()
  @IsOptional()
  reason?: string;
}