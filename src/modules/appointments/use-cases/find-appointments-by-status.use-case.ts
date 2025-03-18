import { Injectable, Logger } from '@nestjs/common';
import { AppointmentRepository } from '../repositories/appointment.repository';
import { Appointment } from '../entities/appointment.entity';
import { AppointmentStatus } from '@prisma/client';

@Injectable()
export class FindAppointmentsByStatusUseCase {
    private readonly logger = new Logger(FindAppointmentsByStatusUseCase.name);

    constructor(private readonly appointmentRepository: AppointmentRepository) { }

    async execute(status: AppointmentStatus, page: number = 1, limit: number = 10): Promise<{ appointments: Appointment[]; total: number }> {
        // Validar y asegurar que page y limit sean números válidos
        const pageNum = page && !isNaN(Number(page)) ? Number(page) : 1;
        const limitNum = limit && !isNaN(Number(limit)) ? Number(limit) : 10;

        this.logger.debug(`Buscando citas con estado ${status}, página ${pageNum}, límite ${limitNum}`);

        const result = await this.appointmentRepository.findManyWithFilter(
            {
                status,
                isActive: true
            },
            pageNum,
            limitNum
        );

        return {
            appointments: result.appointments.map(appointment => ({
                ...appointment,
                patient: {
                    name: appointment.patient?.name || 'No asignado',
                    lastName: appointment.patient?.lastName || '',
                    dni: appointment.patient?.dni || ''
                },
                staff: {
                    name: appointment.staff?.name || 'No asignado',
                    lastName: appointment.staff?.lastName || ''
                },
                service: {
                    name: appointment.service?.name || 'Servicio no especificado'
                },
                branch: {
                    name: appointment.branch?.name || 'Sucursal no especificada'
                }
            })),
            total: result.total
        };
    }
} 