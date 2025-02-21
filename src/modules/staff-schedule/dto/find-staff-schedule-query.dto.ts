import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class FindStaffSchedulesQueryDto {
  @ApiPropertyOptional({ description: 'ID de la sucursal para filtrar' })
  @IsString()
  @IsOptional()
  branchId?: string;

  @ApiPropertyOptional({ description: 'ID del personal para filtrar' })
  @IsString()
  @IsOptional()
  staffId?: string;


} 