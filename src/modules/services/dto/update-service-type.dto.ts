import { ApiPropertyOptional } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';
import { IsString, IsOptional, MinLength } from 'class-validator';
import { CreateServiceTypeDto } from './create-service-type.dto';

export class UpdateServiceTypeDto extends PartialType(CreateServiceTypeDto) {
  @ApiPropertyOptional({
    description: 'Name of the type service',
  })
  @IsString()
  @MinLength(2)
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: 'Description of the type service',
  })
  @IsString()
  @IsOptional()
  description?: string;
}
