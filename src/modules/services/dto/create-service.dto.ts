import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsUUID,
  IsOptional,
  MinLength,
  Min,
} from 'class-validator';

/**
 * DTO para la creación de servicios médicos
 * Incluye validaciones para los campos requeridos
 *
 * @class
 */
export class CreateServiceDto {
  @ApiProperty({
    description: 'Name of the service',
    example: 'Consultation',
  })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({
    description: 'Description of the service',
    example: 'Medical consultation with a specialist',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Price of the service',
    example: 50.0,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({
    description: 'ID of the service type',
  })
  @IsUUID()
  serviceTypeId: string;
}
