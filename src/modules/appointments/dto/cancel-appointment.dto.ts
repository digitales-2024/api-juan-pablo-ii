import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CancelAppointmentDto {
    @ApiProperty({
        description: 'Motivo de la cancelación',
        example: 'El paciente no pudo asistir por motivos personales',
    })
    @IsNotEmpty({ message: 'El motivo de cancelación es requerido' })
    @IsString({ message: 'El motivo de cancelación debe ser un texto' })
    cancellationReason: string;
} 