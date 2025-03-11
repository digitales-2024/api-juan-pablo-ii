import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class NoShowAppointmentDto {
    @ApiProperty({
        description: 'Razón por la que el paciente no se presentó a la cita',
        example: 'El paciente no se presentó sin previo aviso',
    })
    @IsNotEmpty({ message: 'La razón de no presentación es requerida' })
    @IsString({ message: 'La razón debe ser un texto' })
    @MaxLength(500, { message: 'La razón no debe exceder los 500 caracteres' })
    noShowReason: string;
} 