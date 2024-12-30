// entities/event.entity.ts
import { ApiProperty } from '@nestjs/swagger';

export class Event {
  @ApiProperty()
  id: string;

  @ApiProperty()
  calendarioId: string;

  @ApiProperty()
  appointmentId: string;

  @ApiProperty()
  titulo: string;

  @ApiProperty()
  descripcion?: string;

  @ApiProperty()
  fechaInicio: string;

  @ApiProperty()
  fechaFin: string;

  @ApiProperty()
  todoElDia: boolean;

  @ApiProperty()
  tipo: string;

  @ApiProperty()
  color?: string;

  @ApiProperty()
  esPermiso: boolean;

  @ApiProperty()
  tipoPermiso?: string;

  @ApiProperty()
  estadoPermiso?: string;
}
