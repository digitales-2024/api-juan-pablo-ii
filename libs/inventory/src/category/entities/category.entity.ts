import { ApiProperty } from '@nestjs/swagger';

export class Paciente {
  @ApiProperty()
  id: string;

  @ApiProperty()
  nombre: string;

  @ApiProperty()
  apellido?: string;

  @ApiProperty()
  dni: string;

  @ApiProperty()
  cumpleanos: Date;

  @ApiProperty()
  sexo: boolean;

  @ApiProperty()
  direccion?: string;

  @ApiProperty()
  telefono?: string;

  @ApiProperty()
  correo?: string;

  @ApiProperty()
  fechaRegistro: Date;

  @ApiProperty()
  alergias?: string;

  @ApiProperty()
  medicamentosActuales?: string;

  @ApiProperty()
  contactoEmergencia?: string;

  @ApiProperty()
  telefonoEmergencia?: string;

  @ApiProperty()
  seguroMedico?: string;

  @ApiProperty()
  estadoCivil?: string;

  @ApiProperty()
  ocupacion?: string;

  @ApiProperty()
  lugarTrabajo?: string;

  @ApiProperty()
  tipoSangre?: string;

  @ApiProperty()
  antecedentesFamiliares?: string;

  @ApiProperty()
  habitosVida?: string;

  @ApiProperty()
  vacunas?: string;

  @ApiProperty()
  medicoCabecera?: string;

  @ApiProperty()
  idioma?: string;

  @ApiProperty()
  autorizacionTratamiento?: string;

  @ApiProperty()
  observaciones?: string;

  @ApiProperty()
  fotografiaPaciente?: string;
}
