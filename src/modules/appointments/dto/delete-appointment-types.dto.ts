import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class DeleteAppointmentTypesDto {
  @ApiProperty({
    type: [String],
    description: 'Array of appointment type IDs to delete',
  })
  @IsArray()
  @IsString({ each: true })
  ids: string[];
}
