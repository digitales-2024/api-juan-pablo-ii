import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateServiceTypeDto {
  @ApiProperty({
    description: 'Name of the service type',
    example: 'Consultation',
  })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({
    description: 'Description of the service type',
    example: 'Medical consultation with a specialist',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}
