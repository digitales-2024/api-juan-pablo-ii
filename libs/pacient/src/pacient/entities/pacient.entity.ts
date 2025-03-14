import { ApiProperty } from '@nestjs/swagger';
import { Prescription } from '@pacient/pacient/recipe/entities/recipe.entity';

export class Patient {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({
    required: false,
  })
  lastName?: string;

  @ApiProperty()
  dni: string;

  @ApiProperty()
  birthDate: string;

  @ApiProperty()
  gender: string;

  @ApiProperty({
    required: false,
  })
  address?: string;

  @ApiProperty({
    required: false,
  })
  phone?: string;

  @ApiProperty({
    required: false,
  })
  email?: string;

  @ApiProperty({
    required: false,
  })
  emergencyContact?: string;

  @ApiProperty({
    required: false,
  })
  emergencyPhone?: string;

  @ApiProperty({
    required: false,
  })
  healthInsurance?: string;

  @ApiProperty({
    required: false,
  })
  maritalStatus?: string;

  @ApiProperty({
    required: false,
  })
  occupation?: string;

  @ApiProperty({
    required: false,
  })
  workplace?: string;

  @ApiProperty({
    required: false,
  })
  bloodType?: string;

  @ApiProperty({
    required: false,
  })
  primaryDoctor?: string;

  @ApiProperty({
    required: false,
  })
  sucursal?: string;

  @ApiProperty({
    required: false,
  })
  notes?: string;

  @ApiProperty({
    required: false,
  })
  patientPhoto?: string;

  @ApiProperty()
  isActive: boolean;
}

export class PatientPrescriptions {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({
    required: false,
  })
  lastName?: string;

  @ApiProperty()
  dni: string;

  @ApiProperty()
  birthDate: string;

  @ApiProperty()
  gender: string;

  @ApiProperty({
    required: false,
  })
  address?: string;

  @ApiProperty({
    required: false,
  })
  phone?: string;

  @ApiProperty({
    required: false,
  })
  email?: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty({
    type: [Prescription],
  })
  Prescription: Prescription[];
}
