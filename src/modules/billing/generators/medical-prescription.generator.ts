import { BaseOrderGenerator } from '@pay/pay/generators/base-order.generator';
import { IOrder } from '@pay/pay/interfaces';
import { OrderStatus, OrderType } from '@pay/pay/interfaces/order.types';
import { CreateMedicalPrescriptionBillingDto } from '../dto/create-medical-prescription-billing.dto';
import { MedicalPrescriptionMetadata } from '../interfaces/metadata.interfaces';

// interface MedicamentoRecetaData {
//   id: string;
//   nombre: string;
//   cantidad: number;
//   precio: number;
//   subtotal: number;
// }

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

  async generate(input: CreateMedicalPrescriptionBillingDto): Promise<IOrder> {
    const metadata = this.createEmptyMetadata(input);

    return {
      ...this.createOrderBase(),
      code: this.generateCode('MP'),
      type: OrderType.MEDICAL_PRESCRIPTION_ORDER,
      status: OrderStatus.PENDING,
      movementTypeId: '',
      referenceId: input.recipeId, // Usamos el primer ID de cita como referencia
      sourceId: '',
      targetId: '',
      subtotal: 0, // Estos valores deberán ser calculados por otro servicio
      tax: 0,
      total: input.amountPaid || 0,
      currency: input.currency || 'PEN',
      date: new Date(),
      notes: input.notes,
      metadata: JSON.stringify({
        ...metadata,
        ...input.metadata,
      }),
    };
  }

  async calculateTotal(
    input: CreateMedicalPrescriptionBillingDto,
  ): Promise<number> {
    return input.amountPaid || 0;
  }

  /**
   * Crea una estructura de metadata vacía para una orden de receta médica
   */
  createEmptyMetadata(createDto: CreateMedicalPrescriptionBillingDto) {
    const metadata: MedicalPrescriptionMetadata = {
      patientDetails: {
        fullName: '',
        dni: '',
        address: '',
        phone: '',
      },
      orderDetails: {
        transactionType: 'PRESCRIPTION',
        branchId: createDto.branchId || '',
        staffId: '',
        prescriptionDate: new Date(),
        products: [],
        services: [],
        transactionDetails: {
          subtotal: 0,
          tax: 0,
          total: createDto.amountPaid || 0,
        },
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
