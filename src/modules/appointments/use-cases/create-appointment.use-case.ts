import { HttpStatus, Injectable, BadRequestException, Logger } from '@nestjs/common';
import { CreateAppointmentDto } from '../dto/create-appointment.dto';
import { AppointmentRepository } from '../repositories/appointment.repository';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';
import { Appointment } from '../entities/appointment.entity';
import { EventService } from '@calendar/calendar/event/services/event.service';
import * as moment from 'moment-timezone';

@Injectable()
export class CreateAppointmentUseCase {
  private readonly logger = new Logger(CreateAppointmentUseCase.name);
  private readonly timeZone = 'America/Lima';

  constructor(
    private readonly appointmentRepository: AppointmentRepository,
    private readonly eventService: EventService,
    private readonly auditService: AuditService,
  ) { }

  async execute(
    createAppointmentDto: CreateAppointmentDto,
    user: UserData,
  ): Promise<HttpResponse<Appointment>> {
    try {
      // Las fechas ya vienen en UTC desde el frontend
      // No necesitamos convertirlas a Lima time, solo necesitamos parsearlas correctamente
      const start = new Date(createAppointmentDto.start);
      const end = new Date(createAppointmentDto.end);

      this.logger.debug(`Fecha inicio recibida (UTC): ${createAppointmentDto.start}`);
      this.logger.debug(`Fecha fin recibida (UTC): ${createAppointmentDto.end}`);
      this.logger.debug(`Fecha inicio parseada (UTC): ${start.toISOString()}`);
      this.logger.debug(`Fecha fin parseada (UTC): ${end.toISOString()}`);
      this.logger.debug(`Fecha inicio Lima: ${moment(start).tz(this.timeZone).format('YYYY-MM-DD HH:mm:ss')}`);
      this.logger.debug(`Fecha fin Lima: ${moment(end).tz(this.timeZone).format('YYYY-MM-DD HH:mm:ss')}`);

      // 1. Validar intervalo de 15 minutos exactos
      const duration = end.getTime() - start.getTime();
      this.logger.debug(`Duración de la cita: ${duration} ms`);
      if (duration !== 15 * 60 * 1000) {
        throw new BadRequestException('Las citas deben ser de 15 minutos exactos');
      }

      // 2. Validar alineación a slots de 15 mins (00, 15, 30, 45)
      // Convertir a hora local para validar los minutos
      const startLima = moment(start).tz(this.timeZone);
      if (startLima.minutes() % 15 !== 0 || startLima.seconds() !== 0 || startLima.milliseconds() !== 0) {
        throw new BadRequestException('La hora de inicio debe estar alineada a intervalos de 15 minutos');
      }

      // 3. Buscar TURNOS del doctor que contengan el slot
      this.logger.debug(`Buscando TURNO para staff: ${createAppointmentDto.staffId}`);
      const validTurn = await this.eventService.findAvailableTurn(
        createAppointmentDto.staffId,
        start,
        end
      );

      if (!validTurn) {
        this.logger.warn(`No se encontró TURNO disponible para el staff ${createAppointmentDto.staffId}`);
        this.logger.warn(`Rango buscado (UTC): ${start.toISOString()} - ${end.toISOString()}`);
        this.logger.warn(`Rango buscado (Lima): ${moment(start).tz(this.timeZone).format('YYYY-MM-DD HH:mm:ss')} - ${moment(end).tz(this.timeZone).format('YYYY-MM-DD HH:mm:ss')}`);
        throw new BadRequestException('No hay turnos disponibles para este horario');
      }

      this.logger.debug(`TURNO encontrado: ${JSON.stringify(validTurn)}`);

      // 4. Verificar solapamientos
      const overlappingAppointments = await this.appointmentRepository.findMany({
        where: {
          staffId: createAppointmentDto.staffId,
          status: 'CONFIRMED',
          isActive: true,
          OR: [
            {
              AND: [
                { start: { lt: end } },
                { end: { gt: start } }
              ]
            },
            { start: { equals: start } }
          ]
        }
      });

      if (overlappingAppointments.length > 0) {
        this.logger.warn(`Citas CONFIRMADAS solapadas encontradas: ${JSON.stringify(overlappingAppointments)}`);
        this.logger.warn(`Total de citas solapadas: ${overlappingAppointments.length}`);
        this.logger.warn(`Horarios de citas solapadas: ${overlappingAppointments.map(a => `${a.start.toISOString()} - ${a.end.toISOString()}`).join(', ')}`);
        throw new BadRequestException('Ya existe una cita confirmada para este doctor en esta fecha y hora');
      }

      // Crear la cita
      const appointment = await this.appointmentRepository.create({
        staffId: createAppointmentDto.staffId,
        serviceId: createAppointmentDto.serviceId,
        branchId: createAppointmentDto.branchId,
        patientId: createAppointmentDto.patientId,
        start: start,
        end: end,
        status: 'PENDING',
        type: createAppointmentDto.type || 'CONSULTA',
        notes: createAppointmentDto.notes,
        cancellationReason: createAppointmentDto.cancellationReason,
        rescheduledFromId: createAppointmentDto.rescheduledFromId,
        isActive: true
      });

      this.logger.debug(`Cita creada: ${JSON.stringify(appointment)}`);

      // Registrar auditoría
      await this.auditService.create({
        entityId: appointment.id,
        entityType: 'Appointment',
        action: AuditActionType.CREATE,
        performedById: user.id,
        createdAt: new Date(),
      });

      return {
        statusCode: HttpStatus.CREATED,
        message: 'Cita médica creada exitosamente',
        data: appointment,
      };
    } catch (error) {
      this.logger.error(`Error al crear cita: ${error.message}`);
      this.logger.error(error.stack);
      throw error;
    }
  }

  private async createEventForAppointment(appointment: Appointment) {
    // Lógica para crear el evento asociado a la cita
    // Implementar según tu repositorio de eventos
  }
}
