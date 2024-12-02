import { ApiPropertyOptional } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';
import { CreateServiceDto } from './create-service.dto';
import {
  IsString,
  IsNumber,
  IsUUID,
  IsOptional,
  MinLength,
  Min,
} from 'class-validator';

export class UpdateServiceDto extends PartialType(CreateServiceDto) {
  @ApiPropertyOptional({
    description: 'Name of the service',
    example: 'Consultation',
  })
  @IsString()
  @MinLength(2)
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: 'Description of the service',
    example: 'Medical consultation with a specialist',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Price of the service',
    example: 50.0,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @ApiPropertyOptional({
    description: 'ID of the service type',
  })
  @IsUUID()
  @IsOptional()
  serviceTypeId?: string;
}
