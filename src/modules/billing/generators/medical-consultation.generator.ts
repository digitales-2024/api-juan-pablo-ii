import { BaseOrderGenerator } from '@pay/pay/generators/base-order.generator';
import { IOrder } from '@pay/pay/interfaces';
import { OrderStatus, OrderType } from '@pay/pay/interfaces/order.types';

// Interfaces para simular respuestas de otros servicios
interface ConsultaData {
  id: string;
  tipo: string;
  doctorId: string;
  pacienteId: string;
  fecha: Date;
  estado: string;
  precio: number;
}

/**
 * Generador para órdenes de facturación de consultas médicas.
 * @remarks
 * Para implementar esto en producción, necesitarás:
 * 1. Un servicio de consultas médicas que exponga:
 *    - findOne(id: string): Promise<ConsultaData>
 *    - findPrecioByTipo(tipo: string): Promise<number>
 * 2. Un servicio de doctores que exponga:
 *    - findOne(id: string): Promise<DoctorData>
 *    - validateDisponibilidad(doctorId: string, fecha: Date): Promise<boolean>
 * 3. Un servicio de pacientes que exponga:
 *    - findOne(id: string): Promise<PacienteData>
 *    - validateDeudas(pacienteId: string): Promise<boolean>
 */
export class MedicalConsultationGenerator extends BaseOrderGenerator {
  type = OrderType.MEDICAL_CONSULTATION_ORDER;

  async generate(input: MedicalConsultationInput): Promise<IOrder> {
    const consulta = await this.mockConsultaService(input.consultaId);
    const subtotal = await this.calculateTotal(input);
    const { tax, total } = await this.calculateTotals(subtotal);

    // Crear el objeto de servicio
    const serviceData = {
      id: `service-${consulta.id}`,
      name: consulta.tipo,
      price: subtotal,
    };

    // Combinar metadata existente con datos del servicio
    const combinedMetadata = {
      ...input.metadata,
      services: [serviceData],
      tipoConsulta: consulta.tipo,
      doctorId: consulta.doctorId,
      pacienteId: consulta.pacienteId,
      fechaConsulta: consulta.fecha,
      estado: consulta.estado,
    };

    return {
      ...this.createOrderBase(),
      code: this.generateCode('MC'),
      type: OrderType.MEDICAL_CONSULTATION_ORDER,
      status: OrderStatus.PENDING,
      movementTypeId: input.movementTypeId,
      referenceId: input.consultaId,
      sourceId: consulta.pacienteId,
      targetId: consulta.doctorId,
      subtotal,
      tax,
      total,
      currency: input.currency || 'PEN',
      date: input.date || new Date(),
      dueDate: input.dueDate,
      notes: input.notes,
      metadata: combinedMetadata,
    };
  }

  /**
   * Simula un servicio de consultas médicas.
   * @remarks
   * En producción, esto debería ser reemplazado por un servicio real que:
   * - Valide que la consulta existe
   * - Valide que la consulta pertenece al paciente correcto
   * - Valide que la consulta está en un estado válido para facturación
   * - Obtenga el precio real de la consulta según tipo/doctor/especialidad
   */
  private async mockConsultaService(consultaId: string): Promise<ConsultaData> {
    return {
      id: consultaId,
      tipo: 'CONSULTA_GENERAL',
      doctorId: 'doctor-123',
      pacienteId: 'paciente-456',
      fecha: new Date(),
      estado: 'COMPLETADA',
      precio: 100,
    };
  }

  async calculateTotal(input: MedicalConsultationInput): Promise<number> {
    // Si viene un total preestablecido, lo usamos
    if (input.total) return input.total;

    const consulta = await this.mockConsultaService(input.consultaId);
    // Aquí iría la lógica real para obtener el precio de la consulta
    return consulta.precio || 100;
  }
}

export interface MedicalConsultationInput {
  consultaId: string;
  movementTypeId: string;
  total?: number;
  currency?: string;
  date?: Date;
  dueDate?: Date;
  notes?: string;
  metadata?: Record<string, any>;
}
