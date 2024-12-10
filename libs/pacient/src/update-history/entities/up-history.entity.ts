// up-history.entity.ts
import { ApiProperty } from '@nestjs/swagger';

export class UpHistory {
  @ApiProperty()
  id: string;

  @ApiProperty()
  consultaMedicaId: string;

  @ApiProperty()
  personalId: string;

  @ApiProperty()
  sucursalId: string;

  @ApiProperty()
  historiaMedicaId: string;

  @ApiProperty()
  receta: boolean;

  @ApiProperty()
  recetaMedicaId?: string;

  @ApiProperty()
  fecha: Date;

  @ApiProperty()
  updateHistoria: any;

  @ApiProperty()
  description?: string;

  @ApiProperty()
  descansoMedico: boolean;

  @ApiProperty()
  descripDescanso?: string;
}
