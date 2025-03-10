import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateAppointmentUserDto {
  @ApiProperty({
    description: 'ID de la sucursal donde se emite la receta',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  status: string;
}
