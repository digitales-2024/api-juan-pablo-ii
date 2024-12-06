// history.entity.ts
import { ApiProperty } from '@nestjs/swagger';

export class History {
  @ApiProperty()
  id: string;

  @ApiProperty()
  pacienteId: string;

  @ApiProperty()
  historiaMedica: any;

  @ApiProperty()
  date: Date;

  @ApiProperty()
  description?: string;
}
