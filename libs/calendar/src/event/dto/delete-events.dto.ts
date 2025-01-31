import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class DeleteEventsDto {
  @ApiProperty({ 
    type: [String],
    description: 'Array de IDs de eventos a eliminar'
  })
  @IsArray()
  @IsString({ each: true })
  ids: string[];
} 