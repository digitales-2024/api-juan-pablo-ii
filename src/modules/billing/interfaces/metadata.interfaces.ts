import { ApiProperty } from '@nestjs/swagger';

export class BaseServiceItem {
  @ApiProperty({ description: 'Identificador único del servicio' })
  id: string;

  @ApiProperty({ description: 'Nombre del servicio' })
  name: string;

  @ApiProperty({ type: Number, description: 'Cantidad del servicio' })
  quantity: number;

  @ApiProperty({ type: Number, description: 'Subtotal del servicio' })
  subtotal: number;
}

export class ProductMovement {
  @ApiProperty({ description: 'Identificador único del producto' })
  productId: string;

  @ApiProperty({ type: Number, description: 'Cantidad del producto' })
  quantity: number;
}

export class DiscountDetails {
  @ApiProperty({ description: 'Tipo de descuento' })
  type: string;

  @ApiProperty({ type: Number, description: 'Monto del descuento' })
  amount: number;

  @ApiProperty({ required: false, description: 'Descripción del descuento' })
  description?: string;
}

export class TransactionDetails {
  @ApiProperty({
    required: false,
    type: Date,
    description: 'Fecha límite de pago',
  })
  paymentDueDate?: Date;

  @ApiProperty({
    type: [DiscountDetails],
    required: false,
    description: 'Lista de descuentos aplicados',
  })
  discounts?: DiscountDetails[];

  @ApiProperty({ type: Number, description: 'Subtotal de la transacción' })
  subtotal: number;

  @ApiProperty({ type: Number, description: 'Impuesto aplicado' })
  tax: number;

  @ApiProperty({ type: Number, description: 'Total de la transacción' })
  total: number;
}

export class OrderDetails {
  @ApiProperty({
    enum: ['SALE', 'PURCHASE', 'MEDICAL_CONSULTATION', 'PRESCRIPTION'],
    description: 'Tipo de transacción',
  })
  transactionType:
    | 'SALE'
    | 'PURCHASE'
    | 'MEDICAL_CONSULTATION'
    | 'PRESCRIPTION';

  @ApiProperty({ required: false, description: 'ID del almacén' })
  storageId?: string;

  @ApiProperty({ description: 'ID de la sucursal' })
  branchId: string;

  @ApiProperty({
    type: [ProductMovement],
    required: false,
    description: 'Productos involucrados',
  })
  products?: ProductMovement[];
}

export class BaseOrderMetadata {
  @ApiProperty({
    type: [BaseServiceItem],
    description: 'Servicios incluidos en la orden',
  })
  services: BaseServiceItem[];

  @ApiProperty({ type: OrderDetails, description: 'Detalles de la orden' })
  orderDetails: OrderDetails;

  @ApiProperty({
    type: TransactionDetails,
    required: false,
    description: 'Detalles de la transacción',
  })
  transactionDetails?: TransactionDetails;

  @ApiProperty({ required: false, description: 'Campos personalizados' })
  customFields?: Record<string, any>;
}

export class SaleOrderDetails {
  @ApiProperty({ enum: ['SALE'], description: 'Tipo de transacción: venta' })
  transactionType: 'SALE';

  @ApiProperty({ description: 'ID del almacén' })
  storageId: string;

  @ApiProperty({ description: 'ID de la sucursal' })
  branchId: string;

  @ApiProperty({
    type: [ProductMovement],
    description: 'Productos de la venta',
  })
  products: ProductMovement[];
}

export class InventoryDetails {
  @ApiProperty({ description: 'Ubicación en inventario' })
  location: string;

  @ApiProperty({ required: false, description: 'Lote del producto' })
  batch?: string;
}

export class ProductSaleMetadata extends BaseOrderMetadata {
  @ApiProperty({
    type: SaleOrderDetails,
    description: 'Detalles de la orden de venta',
  })
  orderDetails: SaleOrderDetails;

  @ApiProperty({
    type: InventoryDetails,
    required: false,
    description: 'Detalles de inventario',
  })
  inventory?: InventoryDetails;
}

export class PurchaseOrderDetails {
  @ApiProperty({
    enum: ['PURCHASE'],
    description: 'Tipo de transacción: compra',
  })
  transactionType: 'PURCHASE';

  @ApiProperty({ description: 'ID del almacén' })
  storageId: string;

  @ApiProperty({ description: 'ID de la sucursal' })
  branchId: string;

  @ApiProperty({
    type: [ProductMovement],
    description: 'Productos de la compra',
  })
  products: ProductMovement[];

  @ApiProperty({ description: 'ID del proveedor' })
  supplierId: string;
}

export class PurchaseDetails {
  @ApiProperty({ required: false, description: 'Número de orden de compra' })
  purchaseOrder?: string;

  @ApiProperty({
    required: false,
    type: Date,
    description: 'Fecha esperada de entrega',
  })
  expectedDeliveryDate?: Date;

  @ApiProperty({ required: false, description: 'Instrucciones de entrega' })
  deliveryInstructions?: string;
}

export class ProductPurchaseMetadata extends BaseOrderMetadata {
  @ApiProperty({
    type: PurchaseOrderDetails,
    description: 'Detalles de la orden de compra',
  })
  orderDetails: PurchaseOrderDetails;

  @ApiProperty({
    type: PurchaseDetails,
    required: false,
    description: 'Detalles de la compra',
  })
  purchaseDetails?: PurchaseDetails;
}

export class MedicalConsultationOrderDetails {
  @ApiProperty({
    enum: ['MEDICAL_CONSULTATION'],
    description: 'Tipo de transacción: consulta médica',
  })
  transactionType: 'MEDICAL_CONSULTATION';

  @ApiProperty({ description: 'ID de la sucursal' })
  branchId: string;

  @ApiProperty({ description: 'ID del doctor' })
  doctorId: string;

  @ApiProperty({ description: 'ID del paciente' })
  patientId: string;

  @ApiProperty({ type: Date, description: 'Fecha de la consulta' })
  consultationDate: Date;
}

export class MedicalDetails {
  @ApiProperty({ description: 'Tipo de consulta' })
  consultationType: string;

  @ApiProperty({ description: 'Especialidad médica' })
  specialty: string;

  @ApiProperty({ required: false, description: 'Diagnóstico' })
  diagnosis?: string;

  @ApiProperty({ required: false, description: 'Observaciones' })
  observations?: string;
}

export class MedicalConsultationMetadata extends BaseOrderMetadata {
  @ApiProperty({
    type: MedicalConsultationOrderDetails,
    description: 'Detalles de la orden de consulta médica',
  })
  orderDetails: MedicalConsultationOrderDetails;

  @ApiProperty({
    type: MedicalDetails,
    required: false,
    description: 'Detalles médicos',
  })
  medicalDetails?: MedicalDetails;
}

export class PrescriptionOrderDetails {
  @ApiProperty({
    enum: ['PRESCRIPTION'],
    description: 'Tipo de transacción: receta médica',
  })
  transactionType: 'PRESCRIPTION';

  @ApiProperty({ description: 'ID de la sucursal' })
  branchId: string;

  @ApiProperty({ description: 'ID del doctor' })
  doctorId: string;

  @ApiProperty({ description: 'ID del paciente' })
  patientId: string;

  @ApiProperty({ type: Date, description: 'Fecha de la receta' })
  prescriptionDate: Date;
}

export class PrescriptionDetails {
  @ApiProperty({ description: 'Tipo de receta' })
  prescriptionType: string;

  @ApiProperty({ description: 'Diagnóstico' })
  diagnosis: string;

  @ApiProperty({ required: false, description: 'Instrucciones' })
  instructions?: string;

  @ApiProperty({ required: false, type: Date, description: 'Fecha de validez' })
  validUntil?: Date;
}

export class MedicalPrescriptionMetadata extends BaseOrderMetadata {
  @ApiProperty({
    type: PrescriptionOrderDetails,
    description: 'Detalles de la orden de receta médica',
  })
  orderDetails: PrescriptionOrderDetails;

  @ApiProperty({
    type: PrescriptionDetails,
    required: false,
    description: 'Detalles de la receta',
  })
  prescriptionDetails?: PrescriptionDetails;
}
