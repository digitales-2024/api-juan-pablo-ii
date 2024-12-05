// entities/recurrence.entity.ts
import { ApiProperty } from '@nestjs/swagger';

export class Recurrence {
  @ApiProperty()
  id: string;

  @ApiProperty()
  calendarioId: string;

  @ApiProperty()
  frecuencia: string;

  @ApiProperty()
  intervalo: number;

  @ApiProperty()
  fechaInicio: Date;

  @ApiProperty()
  fechaFin?: Date;
}
