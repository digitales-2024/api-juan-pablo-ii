import { ApiProperty } from '@nestjs/swagger';

export class Consultation {
  @ApiProperty()
  id: string;

  @ApiProperty()
  serviceId: string;

  @ApiProperty()
  pacienteId?: string;

  @ApiProperty()
  sucursalId: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  date: Date;
}
