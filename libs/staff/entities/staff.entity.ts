import { ApiProperty } from '@nestjs/swagger';

export class Staff {
  @ApiProperty({ description: 'ID único del personal' })
  id: string;

  @ApiProperty({ description: 'ID del tipo de personal' })
  staffTypeId: string;

  @ApiProperty({ description: 'ID del usuario asociado' })
  userId: string;

  @ApiProperty({ description: 'Nombre del personal' })
  name: string;

  @ApiProperty({ description: 'Correo electrónico' })
  email: string;

  @ApiProperty({ description: 'Número telefónico' })
  phone: string;

  @ApiProperty({ description: 'Apellido del personal' })
  lastName: string;

  @ApiProperty({ description: 'Documento Nacional de Identidad' })
  dni: string;

  @ApiProperty({ description: 'Fecha de nacimiento' })
  birth: string;

  @ApiProperty({ description: 'Estado activo/inactivo del personal' })
  isActive: boolean;

  @ApiProperty({ description: 'Fecha de creación del registro' })
  createdAt: Date;

  @ApiProperty({ description: 'Fecha de última actualización' })
  updatedAt: Date;
}

export class StaffType {
  @ApiProperty({ description: 'ID único del tipo de personal' })
  id: string;

  @ApiProperty({ description: 'Nombre del tipo de personal' })
  name: string;

  @ApiProperty({ description: 'Descripción del tipo de personal', required: false })
  description?: string;

  @ApiProperty({ description: 'Estado activo/inactivo del tipo de personal' })
  isActive: boolean;

  @ApiProperty({ description: 'Fecha de creación del registro' })
  createdAt: Date;

  @ApiProperty({ description: 'Fecha de última actualización' })
  updatedAt: Date;
}
