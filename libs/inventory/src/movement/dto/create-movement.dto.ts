import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsNumber,
  IsBoolean,
  IsDate,
} from 'class-validator';

export class CreateMovementDto {
  @ApiProperty({
    description: 'ID del tipo de movimiento',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsString()
  @IsOptional()
  movementTypeId?: string;

  @ApiProperty({
    description: 'ID del ingreso',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsString()
  @IsOptional()
  incomingId?: string;

  @ApiProperty({
    description: 'ID de la salida',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsString()
  @IsOptional()
  outgoingId?: string;

  @ApiProperty({
    description: 'ID del producto',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  productoId: string;

  @ApiProperty({
    description: 'Cantidad de producto que se movió',
    example: 100.0,
    required: true,
  })
  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @ApiProperty({
    description: 'Fecha en que ocurrió el evento',
    example: '2023-12-01T15:30:00Z',
    required: true,
  })
  @IsDate()
  @IsNotEmpty()
  date: Date;

  @ApiProperty({
    description: 'Estado del movimiento',
    example: false,
    required: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  state: boolean;
}
