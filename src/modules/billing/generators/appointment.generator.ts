import { BaseOrderGenerator } from '@pay/pay/generators/base-order.generator';
import { IOrder } from '@pay/pay/interfaces';
import { OrderStatus, OrderType } from '@pay/pay/interfaces/order.types';
import { CreateMedicalAppointmentBillingDto } from '../dto/create-medical-appointment-billing.dto';
import { Injectable } from '@nestjs/common';
import { AppointmentService } from 'src/modules/appointments/services/appointment.service';
import { Patient } from '@pacient/pacient/pacient/entities/pacient.entity';
import { MedicalAppointmentMetadata } from '../interfaces/metadata.interfaces';

/**
 * Generador para órdenes de facturación de citas médicas.
 */
@Injectable()
export class AppointmentGenerator extends BaseOrderGenerator {
  type = OrderType.MEDICAL_APPOINTMENT_ORDER;

  constructor(private readonly appointmentService: AppointmentService) {
    super();
  }

  async generate(input: CreateMedicalAppointmentBillingDto): Promise<IOrder> {
    const appointmentId = input.appointmentId;

    // Obtener el precio del servicio desde AppointmentService
    const servicePrice =
      await this.appointmentService.getServicePriceByAppointmentId(
        appointmentId,
      );
    const total = servicePrice; // El precio del servicio es el total

    const metadata = {
      patientDetails: {
        fullName: '', // Se llenará más tarde
        dni: '',
        address: '',
        phone: '',
      },
      orderDetails: {
        transactionType: 'MEDICAL_APPOINTMENT',
        branchId: '',
        appointmentId: appointmentId,
        consultationDate: new Date(),
        appointmentEnd: '',
        appointmentStart: '',
        transactionDetails: {
          subtotal: 0, // Se llenará más tarde
          tax: 0, // Se llenará más tarde
          total: 0, // Se llenará más tarde
        },
      },
      customFields: input.metadata,
    };

    return {
      ...this.createOrderBase(),
      code: this.generateCode('MA'), // MA = Medical Appointment
      type: OrderType.MEDICAL_APPOINTMENT_ORDER,
      status: OrderStatus.PENDING,
      movementTypeId: '', // Se genera en el use case
      referenceId: input.appointmentId, // Usamos appointmentId como referencia
      sourceId: '', // No aplica para citas médicas
      targetId: '', // No aplica para citas médicas
      subtotal: total, // Usamos el total como subtotal también
      tax: 0, // Impuesto en 0 por ahora
      total,
      currency: input.currency || 'PEN', // Moneda por defecto PEN
      date: new Date(),
      notes: input.notes,
      metadata: JSON.stringify(metadata),
    };
  }

  /**
   * Calcula el total de la orden (obteniendo el precio del servicio)
   */
  async calculateTotal(
    input: CreateMedicalAppointmentBillingDto,
  ): Promise<number> {
    const appointmentId = input.appointmentId;
    return this.appointmentService.getServicePriceByAppointmentId(
      appointmentId,
    );
  }

  createEmptyMetadata(
    createDto: CreateMedicalAppointmentBillingDto,
    patient: Patient,
  ): MedicalAppointmentMetadata {
    return {
      patientDetails: {
        fullName: '', // Se llenará más tarde
        dni: '',
        address: '',
        phone: '',
      },
      orderDetails: {
        transactionType: 'MEDICAL_APPOINTMENT',
        appointmentId: '',
        branchId: '',
        consultationDate: new Date(),
        appointmentEnd: '',
        appointmentStart: '',
        appointmentType: '',
        serviceId: '',
        staffId: '',
        transactionDetails: {
          subtotal: 0, // Se llenará más tarde
          tax: 2, // Se llenará más tarde
          total: 0, // Se llenará más tarde
        },
      },
    };
  }
}
