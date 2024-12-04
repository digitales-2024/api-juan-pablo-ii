// entities/calendar.entity.ts
import { ApiProperty } from '@nestjs/swagger';

//Calendar

export class Paciente {
  @ApiProperty()
  id: string;

  @ApiProperty()
  personalId: string;

  @ApiProperty()
  sucursalId: string;

  @ApiProperty()
  nombre: string;

  @ApiProperty()
  color?: string;

  @ApiProperty()
  isDefault: boolean;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
