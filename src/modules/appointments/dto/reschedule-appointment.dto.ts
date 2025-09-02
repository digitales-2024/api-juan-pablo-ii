import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsDateString,
  IsString,
  IsOptional,
  IsUUID,
} from 'class-validator';

export class RescheduleAppointmentDto {
  @ApiProperty({
    description: 'Nueva fecha y hora de la cita',
    example: '2024-03-20T15:00:00Z',
  })
  @IsNotEmpty({ message: 'La nueva fecha y hora es requerida' })
  @IsDateString({}, { message: 'La fecha debe ser válida' })
  newDateTime: string;

  @ApiProperty({
    description: 'Motivo de la reprogramación',
    example: 'El paciente solicitó cambiar la fecha por motivos personales',
  })
  @IsNotEmpty({ message: 'El motivo de reprogramación es requerido' })
  @IsString({ message: 'El motivo de reprogramación debe ser un texto' })
  rescheduleReason: string;

  @ApiProperty({
    description: 'ID del nuevo personal médico (opcional)',
    example: 'staff-uuid-123',
    required: false,
  })
  @IsOptional()
  @IsUUID('4', { message: 'El ID del personal médico debe ser un UUID válido' })
  newStaffId?: string;

  @ApiProperty({
    description: 'ID de la nueva sucursal (opcional)',
    example: 'branch-uuid-456',
    required: false,
  })
  @IsOptional()
  @IsUUID('4', { message: 'El ID de la sucursal debe ser un UUID válido' })
  newBranchId?: string;
} 