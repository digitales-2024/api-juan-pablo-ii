import { ApiProperty } from '@nestjs/swagger';

export class Staff {
  @ApiProperty({ description: 'ID único del personal' })
  id: string;

  @ApiProperty({ description: 'ID del tipo de personal' })
  staffTypeId: string;

  @ApiProperty({ description: 'ID del usuario asociado', nullable: true })
  userId: string | null;

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

  @ApiProperty({
    description: 'Información del tipo de personal',
    example: { name: 'doctor' },
    type: 'object',
    properties: {
      name: {
        type: 'string',
        example: 'doctor',
        description: 'Nombre del tipo de personal'
      }
    }
  })
  staffType?: {
    name: string;
  };
}


export class StaffType {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
