import { Injectable } from '@nestjs/common';
import { AppointmentRepository } from '../repositories/appointment.repository';

@Injectable()
export class FindAppointmentsPaginatedUseCase {

    constructor(private readonly appointmentRepository: AppointmentRepository) { }

    async execute(page: number, limit: number): Promise<{ appointments: any[]; total: number }> {
        const result = await this.appointmentRepository.findManyPaginated(page, Math.min(limit, 50));

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