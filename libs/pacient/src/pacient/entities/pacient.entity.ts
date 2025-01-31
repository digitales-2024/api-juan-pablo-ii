import { ApiProperty } from '@nestjs/swagger';

export class Patient {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  lastName?: string;

  @ApiProperty()
  dni: string;

  @ApiProperty()
  birthDate: Date;

  @ApiProperty()
  gender: string;

  @ApiProperty()
  address?: string;

  @ApiProperty()
  phone?: string;

  @ApiProperty()
  email?: string;

  @ApiProperty()
  emergencyContact?: string;

  @ApiProperty()
  emergencyPhone?: string;

  @ApiProperty()
  healthInsurance?: string;

  @ApiProperty()
  maritalStatus?: string;

  @ApiProperty()
  occupation?: string;

  @ApiProperty()
  workplace?: string;

  @ApiProperty()
  bloodType?: string;

  @ApiProperty()
  primaryDoctor?: string;

  @ApiProperty()
  language?: string;

  @ApiProperty()
  notes?: string;

  @ApiProperty()
  patientPhoto?: string;

  @ApiProperty()
  isActive: boolean;
}
