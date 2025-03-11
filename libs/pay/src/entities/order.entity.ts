// libs/pay/src/entities/order.entity.ts
import { ApiProperty } from '@nestjs/swagger';
import { IOrder } from '../interfaces/order.interface';
import { OrderStatus, OrderType } from '../interfaces/order.types';
import { Payment } from './payment.entity';

export class Order implements IOrder {
  @ApiProperty({
    description: 'ID único de la orden',
    example: '5f8d0a3e-7d5b-4d3e-a6c4-3a7d9b2d4c1a',
  })
  id: string;

  @ApiProperty({
    description: 'Código de referencia de la orden',
    required: false,
    example: 'ORD-20240224-001',
  })
  code?: string;

  @ApiProperty({
    description: 'Tipo de orden',
    enum: OrderType,
    example: OrderType.MEDICAL_PRESCRIPTION_ORDER,
  })
  type: OrderType;

  @ApiProperty({
    description: 'ID del tipo de movimiento asociado',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  })
  movementTypeId: string;

  @ApiProperty({
    description: 'ID de referencia externa',
    example: 'REF-12345',
  })
  referenceId: string;

  @ApiProperty({
    description:
      'ID del origen de fondos. Por lo general, se refiere al proveeder. No existe entidad proveedor',
    required: false,
    example: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
  })
  sourceId?: string;

  @ApiProperty({
    description:
      'ID del destino de fondos, por lo general se refiere al almacén de destino',
    required: false,
    example: 'b2c3d4e5-f6g7-8h9i-0j1k-l2m3n4o5p6q7',
  })
  targetId?: string;

  @ApiProperty({
    description: 'Estado actual de la orden',
    enum: OrderStatus,
    example: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @ApiProperty({
    description: 'Moneda de la transacción',
    example: 'PEN',
    minLength: 3,
    maxLength: 3,
  })
  currency: string;

  @ApiProperty({
    description: 'Subtotal de la orden (sin impuestos)',
    type: 'number',
    example: 150.75,
  })
  subtotal: number;

  @ApiProperty({
    description: 'Impuestos aplicados',
    type: 'number',
    example: 27.14,
  })
  tax: number;

  @ApiProperty({
    description: 'Total a pagar (subtotal + impuestos)',
    type: 'number',
    example: 177.89,
  })
  total: number;

  @ApiProperty({
    description: 'Fecha de creación de la orden',
    example: '2024-02-24T15:30:00Z',
  })
  date: Date;

  @ApiProperty({
    description: 'Notas adicionales',
    required: false,
    example: 'Orden creada para paciente Juan Pérez',
  })
  notes?: string;

  @ApiProperty({
    description: 'Estado de eliminación lógica.',
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Metadatos adicionales en formato JSON',
    required: false,
    type: 'object',
    example: {
      pacienteId: 'PAT-12345',
      medicoId: 'DOC-67890',
      seguro: 'Seguro Salud Total',
    },
  })
  metadata?: Record<string, any>;
}

// "payments": [
// {
// "id": "7a94417b-adfc-4955-af70-33dc1a8455cd",
// "orderId": "5032c3a6-8663-48ef-aca9-0c1db19c4c10",
// "date": "2025-03-10 10:33:03",
// "status": "PROCESSING",
// "type": "REGULAR",
// "amount": 23,
// "description": "string",
// "paymentMethod": "CASH",
// "voucherNumber": "string",
// "verifiedBy": "Super Admin",
// "verifiedAt": "2025-03-10 10:22:55",
// "isActive": true,
// "createdAt": "2025-03-10 10:22:55",
// "updatedAt": "2025-03-10 10:33:09"
// }
export class DetailedOrder extends Order {
  @ApiProperty({
    description: 'Detalles del pago',
    type: [Payment],
  })
  payments: Payment[];
}
