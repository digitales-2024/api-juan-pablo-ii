import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefundAppointmentDto {
    @ApiProperty({
        description: 'Motivo del reembolso',
        example: 'El paciente solicitó reembolso por problemas de salud',
    })
    @IsNotEmpty({ message: 'El motivo del reembolso es requerido' })
    @IsString({ message: 'El motivo del reembolso debe ser un texto' })
    refundReason: string;
} 