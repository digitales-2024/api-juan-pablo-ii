import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class DeleteTimeOffsDto {
  @ApiProperty({ 
    type: [String],
    description: 'Array de IDs de ausencias temporales a eliminar'
  })
  @IsArray()
  @IsString({ each: true })
  ids: string[];
} 