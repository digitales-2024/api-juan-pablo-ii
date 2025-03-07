import { BaseOrderGenerator } from '@pay/pay/generators/base-order.generator';
import { IOrder } from '@pay/pay/interfaces';
import { OrderStatus, OrderType } from '@pay/pay/interfaces/order.types';
import { Injectable } from '@nestjs/common';
import { CreateMedicalPrescriptionBillingDto } from '../dto/create-medical-prescription-billing.dto';

// Interfaces para simular respuestas de otros servicios
interface RecetaData {
  id: string;
  tipo: string;
  doctorId: string;
  pacienteId: string;
  fecha: Date;
  estado: string; // PENDIENTE, COMPLETADA, ANULADA
  medicamentos: MedicamentoRecetaData[];
  total: number;
}

interface MedicamentoRecetaData {
  id: string;
  nombre: string;
  cantidad: number;
  precio: number;
  subtotal: number;
}

/**
 * Generador para órdenes de facturación de recetas médicas.
 * @remarks
 * Para implementar esto en producción, necesitarás:
 * 1. Un servicio de recetas que exponga:
 *    - findOne(id: string): Promise<RecetaData>
 *    - validateReceta(id: string): Promise<boolean>
 *    - getMedicamentos(recetaId: string): Promise<MedicamentoRecetaData[]>
 * 2. Un servicio de inventario que exponga:
 *    - checkStock(medicamentoId: string, cantidad: number): Promise<boolean>
 *    - getPrecio(medicamentoId: string): Promise<number>
 * 3. Un servicio de pacientes que exponga:
 *    - findOne(id: string): Promise<PacienteData>
 *    - validateDeudas(pacienteId: string): Promise<boolean>
 */
export class MedicalPrescriptionGenerator extends BaseOrderGenerator {
  type = OrderType.MEDICAL_PRESCRIPTION_ORDER;

  async generate(input: MedicalPrescriptionInput): Promise<IOrder> {
    const receta = await this.mockRecetaService(input.recetaId);
    const subtotal = await this.calculateTotal(input);
    const { tax, total } = await this.calculateTotals(subtotal);

    // Crear el objeto de servicios (medicamentos)
    const serviceData = receta.medicamentos.map((med) => ({
      id: med.id,
      name: med.nombre,
      quantity: med.cantidad,
      price: med.precio,
      subtotal: med.subtotal,
    }));

    // Combinar metadata existente con datos del servicio
    const combinedMetadata = {
      ...input.metadata,
      services: serviceData,
      tipoReceta: receta.tipo,
      doctorId: receta.doctorId,
      pacienteId: receta.pacienteId,
      fechaReceta: receta.fecha,
      estado: receta.estado,
      medicamentos: receta.medicamentos,
    };

    return {
      ...this.createOrderBase(),
      code: this.generateCode('MP'),
      type: OrderType.MEDICAL_PRESCRIPTION_ORDER,
      status: OrderStatus.PENDING,
      movementTypeId: input.movementTypeId,
      referenceId: input.recetaId,
      sourceId: receta.pacienteId,
      targetId: receta.doctorId,
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
   * Simula un servicio de recetas médicas.
   * @remarks
   * En producción, esto debería ser reemplazado por un servicio real que:
   * - Valide que la receta existe
   * - Valide que la receta pertenece al paciente correcto
   * - Valide que la receta está en un estado válido para facturación
   * - Obtenga el precio real de cada medicamento según el inventario
   * - Valide el stock disponible de cada medicamento
   */
  private async mockRecetaService(recetaId: string): Promise<RecetaData> {
    // Simular medicamentos recetados
    const medicamentos: MedicamentoRecetaData[] = [
      {
        id: 'med-1',
        nombre: 'Paracetamol 500mg',
        cantidad: 30,
        precio: 0.5,
        subtotal: 15.0,
      },
      {
        id: 'med-2',
        nombre: 'Amoxicilina 500mg',
        cantidad: 21,
        precio: 1.2,
        subtotal: 25.2,
      },
    ];

    // Calcular total de la receta
    const total = medicamentos.reduce((sum, med) => sum + med.subtotal, 0);

    return {
      id: recetaId,
      tipo: 'AMBULATORIA',
      doctorId: 'doctor-123',
      pacienteId: 'paciente-456',
      fecha: new Date(),
      estado: 'PENDIENTE',
      medicamentos,
      total,
    };
  }

  async calculateTotal(input: MedicalPrescriptionInput): Promise<number> {
    // Si viene un total preestablecido, lo usamos
    if (input.total) return input.total;

    const receta = await this.mockRecetaService(input.recetaId);
    // Aquí iría la lógica real para obtener el precio de los medicamentos
    return receta.total || 0;
  }

  /**
   * Crea una estructura de metadata vacía para una orden de receta médica
   */
  createEmptyMetadata(createDto: CreateMedicalPrescriptionBillingDto, patient: any) {
    // Estructura base de la metadata
    const metadata = {
      // Detalles del paciente
      patientDetails: {
        id: patient?.id || '',
        fullName: '',
        dni: '',
        address: '',
        phone: '',
      },
      // Detalles de la orden
      orderDetails: {
        // Detalles de la transacción (se llenarán después)
        transactionDetails: {
          subtotal: 0,
          tax: 0,
          total: 0,
        },
        // Detalles de las citas (se llenarán después)
        appointments: [],
        // Detalles de los productos (se llenarán después)
        products: [],
      },
      // Detalles adicionales
      additionalDetails: {
        notes: createDto.notes || '',
        voucherNumber: createDto.voucherNumber || '',
        paymentMethod: createDto.paymentMethod || 'CASH',
        // Cualquier metadata adicional proporcionada
        ...createDto.metadata,
      },
    };

    return metadata;
  }
}

export interface MedicalPrescriptionInput {
  recetaId: string;
  movementTypeId: string;
  total?: number;
  currency?: string;
  date?: Date;
  dueDate?: Date;
  notes?: string;
  metadata?: Record<string, any>;
}
