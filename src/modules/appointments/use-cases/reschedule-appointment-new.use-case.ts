import { Injectable, BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { AppointmentRepository } from '../repositories/appointment.repository';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';
import { PrismaService } from '@prisma/prisma';
import { Appointment } from '../entities/appointment.entity';
import { OrderService } from '@pay/pay/services/order.service';
import { RescheduleAppointmentDto } from '../dto/reschedule-appointment.dto';
import * as moment from 'moment-timezone';
import { EventService } from '@calendar/calendar/event/services/event.service';

@Injectable()
export class RescheduleAppointmentUseCase {
  private readonly logger = new Logger(RescheduleAppointmentUseCase.name);
  private readonly timeZone = 'America/Lima';

  constructor(
    private readonly appointmentRepository: AppointmentRepository,
    private readonly auditService: AuditService,
    private readonly orderService: OrderService,
    private readonly prisma: PrismaService,
    private readonly eventService: EventService,
  ) {}

  async execute(
    id: string,
    rescheduleAppointmentDto: RescheduleAppointmentDto,
    user: UserData,
  ): Promise<HttpResponse<Appointment>> {
    try {
      this.logger.debug(`Iniciando reprogramación completa de cita ${id}`);

      // 1. Validar cita original
      const originalAppointment = await this.validateOriginalAppointment(id);

      // 2. Preparar datos para la nueva cita
      const newAppointmentData = await this.prepareNewAppointmentData(
        originalAppointment,
        rescheduleAppointmentDto,
      );

      // 3. Validar disponibilidad y conflictos
      await this.validateAvailabilityAndConflicts(newAppointmentData, id);

      // 4. Ejecutar reprogramación en transacción
      const result = await this.executeRescheduleTransaction(
        originalAppointment,
        newAppointmentData,
        rescheduleAppointmentDto,
        user,
        id,
      );

      return {
        statusCode: 200,
        message: 'Cita reprogramada exitosamente',
        data: result,
      };
    } catch (error) {
      this.logger.error(`Error al reprogramar cita ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  private async validateOriginalAppointment(id: string): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findById(id);
    if (!appointment) {
      throw new NotFoundException(`Cita con ID ${id} no encontrada`);
    }

    if (!['PENDING', 'CONFIRMED'].includes(appointment.status)) {
      throw new BadRequestException(
        `Solo se pueden reprogramar citas pendientes o confirmadas. Estado actual: ${appointment.status}`,
      );
    }

    return appointment;
  }

  private async prepareNewAppointmentData(
    originalAppointment: Appointment,
    rescheduleDto: RescheduleAppointmentDto,
  ) {
    // Calcular nueva fecha de inicio y fin
    const start = new Date(rescheduleDto.newDateTime);
    const originalDuration = moment(originalAppointment.end).diff(
      moment(originalAppointment.start),
      'minutes',
    );
    const end = moment(start).add(originalDuration, 'minutes').toDate();

    // Validar que la fecha esté alineada a intervalos de 15 minutos
    const startLima = moment(start).tz(this.timeZone);
    if (
      startLima.minutes() % 15 !== 0 ||
      startLima.seconds() !== 0 ||
      startLima.milliseconds() !== 0
    ) {
      throw new BadRequestException('La hora debe estar alineada a intervalos de 15 minutos');
    }

    // Determinar valores objetivo
    const targetStaffId = rescheduleDto.newStaffId || originalAppointment.staffId;
    const targetBranchId = rescheduleDto.newBranchId || originalAppointment.branchId;

    // Validar que el personal médico exista y esté activo
    if (rescheduleDto.newStaffId) {
      const staff = await this.prisma.staff.findFirst({
        where: { id: rescheduleDto.newStaffId, isActive: true },
      });
      if (!staff) {
        throw new BadRequestException('Personal médico no encontrado o inactivo');
      }
    }

    // Validar que la sucursal exista y esté activa
    if (rescheduleDto.newBranchId) {
      const branch = await this.prisma.branch.findFirst({
        where: { id: rescheduleDto.newBranchId, isActive: true },
      });
      if (!branch) {
        throw new BadRequestException('Sucursal no encontrada o inactiva');
      }
    }

    return {
      start,
      end,
      targetStaffId,
      targetBranchId,
      originalDuration,
      startLima,
    };
  }

  private async validateAvailabilityAndConflicts(newData: any, excludeAppointmentId: string) {
    const { start, end, targetStaffId, targetBranchId } = newData;

    // Verificar que hay turnos disponibles para el staff en la sucursal
    this.logger.debug(
      `Validando turnos para staff: ${targetStaffId}, sucursal: ${targetBranchId}`,
    );

    const availableTurn = await this.eventService.findAvailableTurn(targetStaffId, start, end);
    if (!availableTurn) {
      throw new BadRequestException(
        'No hay turnos disponibles para el personal médico en el horario y sucursal solicitados',
      );
    }

    // Verificar que el turno corresponde a la sucursal correcta
    if (availableTurn.branchId !== targetBranchId) {
      throw new BadRequestException(
        'El personal médico no tiene turnos disponibles en la sucursal seleccionada',
      );
    }

    // Verificar conflictos con otras citas confirmadas
    const conflictingAppointments = await this.appointmentRepository.findMany({
      where: {
        staffId: targetStaffId,
        status: 'CONFIRMED',
        isActive: true,
        id: { not: excludeAppointmentId },
        OR: [
          {
            AND: [{ start: { lt: end } }, { end: { gt: start } }],
          },
          { start: { equals: start } },
        ],
      },
    });

    if (conflictingAppointments.length > 0) {
      throw new BadRequestException(
        'Ya existe una cita confirmada para este personal en el horario seleccionado',
      );
    }
  }

  private async executeRescheduleTransaction(
    originalAppointment: Appointment,
    newData: any,
    rescheduleDto: RescheduleAppointmentDto,
    user: UserData,
    originalAppointmentId: string,
  ): Promise<Appointment> {
    return await this.prisma.$transaction(async (tx) => {
      const { start, end, targetStaffId, targetBranchId } = newData;

      // 1. Actualizar o crear evento
      let eventId = originalAppointment.eventId;
      
      if (eventId) {
        // Actualizar evento existente
        await tx.event.update({
          where: { id: eventId },
          data: {
            start,
            end,
            staffId: targetStaffId,
            branchId: targetBranchId,
            updatedAt: new Date(),
          },
        });
        this.logger.debug(`Evento ${eventId} actualizado con nueva información`);
      } else {
        // Crear nuevo evento si no existe
        const newEvent = await tx.event.create({
          data: {
            title: `Cita - ${originalAppointment.patient?.name || 'Paciente'}`,
            type: 'TURNO',
            start,
            end,
            staffId: targetStaffId,
            branchId: targetBranchId,
            status: 'PENDING',
          },
        });
        eventId = newEvent.id;
        this.logger.debug(`Nuevo evento ${eventId} creado`);
      }

      // 2. Marcar cita original como reprogramada
      await tx.appointment.update({
        where: { id: originalAppointmentId },
        data: {
          status: 'RESCHEDULED',
          rescheduleReason: rescheduleDto.rescheduleReason,
          updatedAt: new Date(),
        },
      });

      // 3. Crear nueva cita con los datos actualizados
      const { id: _, ...appointmentDataWithoutId } = originalAppointment;
      const newAppointment = await tx.appointment.create({
        data: {
          staffId: targetStaffId,
          serviceId: originalAppointment.serviceId,
          branchId: targetBranchId,
          patientId: originalAppointment.patientId,
          start,
          end,
          paymentMethod: originalAppointment.paymentMethod,
          status: originalAppointment.status, // Mantener el estado original (PENDING/CONFIRMED)
          type: originalAppointment.type,
          notes: originalAppointment.notes,
          rescheduledFromId: originalAppointmentId,
          rescheduleReason: rescheduleDto.rescheduleReason,
          eventId,
          orderId: originalAppointment.orderId,
        },
        include: {
          staff: true,
          service: true,
          branch: true,
          patient: true,
          event: true,
        },
      });

      this.logger.debug(`Nueva cita creada con ID: ${newAppointment.id}`);

      // 4. Actualizar órdenes asociadas
      const orders = await this.orderService.findOrdersByReferenceId(originalAppointmentId);
      if (orders && orders.length > 0) {
        for (const order of orders) {
          try {
            await this.orderService.update(
              order.id,
              { referenceId: newAppointment.id },
              user,
            );
            this.logger.debug(`Orden ${order.id} actualizada`);
          } catch (orderError) {
            this.logger.error(`Error al actualizar orden ${order.id}: ${orderError.message}`);
          }
        }
      }

      // 5. Registrar auditoría
      await this.auditService.create({
        entityId: originalAppointmentId,
        entityType: 'Appointment',
        action: AuditActionType.UPDATE,
        performedById: user.id,
        createdAt: new Date(),
      });

      return newAppointment;
    });
  }
}
