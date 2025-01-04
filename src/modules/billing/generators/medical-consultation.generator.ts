import { BaseOrderGenerator } from '@pay/pay/generators/base-order.generator';
import { IOrder } from '@pay/pay/interfaces';
import { OrderStatus, OrderType } from '@pay/pay/interfaces/order.types';
import { BadRequestException, Inject } from '@nestjs/common';
import { MedicalConsultationMetadata } from '../interfaces/metadata.interfaces';
import { ConsultationService } from 'libs/consultation/services/consultation.service';
import { ServiceService } from 'src/modules/services/services/service.service';

export interface ConsultationData {
  id: string;
  type: string;
  patientId: string;
  date: Date;
  status: string;
  price: number;
  specialty?: string;
  diagnosis?: string;
  observations?: string;
}

export interface MedicalConsultationInput {
  consultationId: string;
  movementTypeId: string;
  branchId: string;
  total?: number;
  currency?: string;
  date?: Date;
  dueDate?: Date;
  notes?: string;
  metadata?: Record<string, any>;
}

export class MedicalConsultationGenerator extends BaseOrderGenerator {
  type = OrderType.MEDICAL_CONSULTATION_ORDER;

  constructor(
    @Inject(ConsultationService)
    private readonly consultationService: ConsultationService,
    @Inject(ServiceService)
    private readonly serviceService: ServiceService,
  ) {
    super();
  }

  async generate(input: MedicalConsultationInput): Promise<IOrder> {
    // Validar y obtener datos de la consulta
    const consultation = await this.getConsultationData(input.consultationId);
    if (!consultation) {
      throw new BadRequestException('Consulta médica no encontrada');
    }

    // Calcular totales
    const subtotal = input.total || consultation.price;
    const { tax, total } = await this.calculateTotals(subtotal);

    // Crear metadatos de la consulta
    const metadata: MedicalConsultationMetadata = {
      services: [
        {
          id: consultation.id,
          name: `Consulta ${consultation.type}`,
          quantity: 1,
          subtotal: subtotal,
        },
      ],
      orderDetails: {
        transactionType: 'MEDICAL_CONSULTATION',
        branchId: input.branchId,
        doctorId: '',
        patientId: consultation.patientId,
        consultationDate: consultation.date,
      },
      medicalDetails: {
        consultationType: consultation.type,
        specialty: consultation.specialty,
        diagnosis: consultation.diagnosis,
        observations: consultation.observations,
      },
      customFields: input.metadata,
    };

    return {
      ...this.createOrderBase(),
      code: this.generateCode('MC'),
      type: OrderType.MEDICAL_CONSULTATION_ORDER,
      status: OrderStatus.PENDING,
      movementTypeId: input.movementTypeId,
      referenceId: input.consultationId,
      sourceId: consultation.patientId,
      targetId: '',
      subtotal,
      tax,
      total,
      currency: input.currency || 'PEN',
      date: input.date || new Date(),
      dueDate: input.dueDate,
      notes: input.notes,
      metadata,
    };
  }

  private async getConsultationData(
    consultationId: string,
  ): Promise<ConsultationData> {
    // En un entorno real, esto debería obtener los datos de un servicio de consultas médicas
    // Por ahora, simulamos datos de ejemplo

    const consulta = await this.consultationService.findById(consultationId);

    const servicio = await this.serviceService.findById(consulta.serviceId);

    const precioServicio = servicio.price;

    return {
      id: consulta.id,
      type: 'CONSULTA_GENERAL',
      patientId: consulta.pacienteId,
      date: new Date(),
      status: 'PROGRAMADA',
      price: precioServicio,
      specialty: 'Medicina General',
      diagnosis: '',
      observations: '',
    };
  }

  async calculateTotal(input: MedicalConsultationInput): Promise<number> {
    // Si viene un total preestablecido, lo usamos
    if (input.total) return input.total;

    const consultation = await this.getConsultationData(input.consultationId);
    // En un entorno real, aquí obtendrías el precio real de la consulta
    return consultation.price;
  }
}
