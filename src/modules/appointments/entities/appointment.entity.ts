import { ApiProperty } from '@nestjs/swagger';

export class Appointment {
  @ApiProperty()
  id: string;

  @ApiProperty()
  tipoCitaMedicaId: string;

  @ApiProperty()
  personalId: string;

  @ApiProperty()
  consultaId: string;

  @ApiProperty()
  date: Date;

  @ApiProperty()
  description: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  // Relaciones
  @ApiProperty({ required: false })
  TipoCitaMedica?: any;

  @ApiProperty({ required: false })
  personal?: any;

  @ApiProperty({ required: false })
  ConsultaMedica?: any;

  @ApiProperty({ required: false })
  ProcedimientoMedico?: any[];
}
