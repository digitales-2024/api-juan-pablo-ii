import { ApiProperty } from '@nestjs/swagger';

//--------------------------
// Base Items and Details
//--------------------------
export class BaseServiceItem {
  @ApiProperty({ description: 'Identificador único del servicio' })
  id: string;

  @ApiProperty({ description: 'Nombre del servicio' })
  name: string;

  @ApiProperty({ type: Number, description: 'Cantidad del servicio' })
  quantity: number;
}

export class ProductMovement {
  @ApiProperty({ description: 'Identificador único del producto' })
  productId: string;

  @ApiProperty({ description: 'Identificador único del almacén' })
  storageId: string;

  @ApiProperty({ description: 'Nombre del producto' })
  name: string;

  @ApiProperty({ type: Number, description: 'Cantidad del producto' })
  quantity: number;

  @ApiProperty({ description: 'Subtotal del producto' })
  subtotal: number;

  @ApiProperty({ type: Number, description: 'Cantidad del producto' })
  price: number;
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
  @ApiProperty({ type: Number, description: 'Subtotal de la transacción' })
  subtotal: number;

  @ApiProperty({ type: Number, description: 'Impuesto aplicado' })
  tax: number;

  @ApiProperty({ type: Number, description: 'Total de la transacción' })
  total: number;
}
//--------------------------
// Base Metadata Classes
//--------------------------
export class OrderDetails {
  @ApiProperty({
    enum: ['SALE', 'PURCHASE', 'MEDICAL_APPOINTMENT', 'PRESCRIPTION'],
    description: 'Tipo de transacción',
  })
  transactionType: 'SALE' | 'PURCHASE' | 'MEDICAL_APPOINTMENT' | 'PRESCRIPTION';

  @ApiProperty({ description: 'ID de la sucursal' })
  branchId: string;

  @ApiProperty({
    type: TransactionDetails,
    description: 'Detalles de la transacción',
  })
  transactionDetails: TransactionDetails;
}

export class PatientDetailsMetadata {
  @ApiProperty({ description: 'Nombre completo del paciente' })
  fullName: string;

  @ApiProperty({ required: false, description: 'DNI del paciente' })
  dni?: string;

  @ApiProperty({ required: false, description: 'Dirección del paciente' })
  address?: string;

  @ApiProperty({ required: false, description: 'Teléfono del paciente' })
  phone?: string;
}

export class BaseOrderMetadata {
  @ApiProperty({
    description: 'Detalles del paciente',
    type: PatientDetailsMetadata,
  })
  patientDetails: PatientDetailsMetadata;
}

//--------------------------
// Sale Order Metadata
//--------------------------
export class SaleOrderDetails {
  @ApiProperty({ enum: ['SALE'], description: 'Tipo de transacción: venta' })
  transactionType: 'SALE';

  // @ApiProperty({ description: 'ID del almacén' })
  // storageId: string;

  @ApiProperty({ description: 'ID de la sucursal' })
  branchId: string;

  @ApiProperty({
    type: [ProductMovement],
    description: 'Productos de la venta',
  })
  products: ProductMovement[];
  @ApiProperty({
    type: TransactionDetails,
    description: 'Detalles de la transacción',
  })
  transactionDetails: TransactionDetails;
}

export class ProductSaleMetadata extends BaseOrderMetadata {
  @ApiProperty({
    type: SaleOrderDetails,
    description: 'Detalles de la orden de venta',
  })
  orderDetails: SaleOrderDetails;
}

//--------------------------
// Purchase Order Metadata
//--------------------------
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

  @ApiProperty({
    type: TransactionDetails,
    description: 'Detalles de la transacción',
  })
  transactionDetails: TransactionDetails;
}

export class ProductPurchaseMetadata extends BaseOrderMetadata {
  @ApiProperty({
    type: PurchaseOrderDetails,
    description: 'Detalles de la orden de compra',
  })
  orderDetails: PurchaseOrderDetails;
}

//------------------------------------
// Medical Appointment Order Metadata
//------------------------------------
export class MedicalAppointmentOrderDetails {
  @ApiProperty({
    enum: ['MEDICAL_APPOINTMENT'],
    description: 'Tipo de transacción: consulta médica',
  })
  transactionType: 'MEDICAL_APPOINTMENT';

  @ApiProperty({ description: 'ID de la sucursal' })
  branchId: string;

  @ApiProperty({ description: 'ID de la cita médica' })
  appointmentId: string;

  @ApiProperty({ required: false, description: 'ID del personal médico' })
  staffId?: string;

  @ApiProperty({ required: false, description: 'ID del servicio médico' })
  serviceId?: string;

  @ApiProperty({ required: false, description: 'Tipo de cita médica' })
  appointmentType?: string;

  @ApiProperty({
    required: false,
    type: Date,
    description: 'Fecha y hora de inicio de la cita',
  })
  appointmentStart?: string;

  @ApiProperty({
    required: false,
    type: Date,
    description: 'Fecha y hora de fin de la cita',
  })
  appointmentEnd?: string;

  // @ApiProperty({ description: 'ID del paciente' })
  // patientId: string;

  @ApiProperty({ type: Date, description: 'Fecha de la consulta' })
  consultationDate: Date;

  @ApiProperty({
    type: TransactionDetails,
    description: 'Detalles de la transacción',
  })
  transactionDetails: TransactionDetails;
}
export class MedicalAppointmentMetadata extends BaseOrderMetadata {
  @ApiProperty({
    type: MedicalAppointmentOrderDetails,
    description: 'Detalles de la orden de consulta médica',
  })
  orderDetails: MedicalAppointmentOrderDetails;
}

// Prescription Order Metadata
//--------------------------
export class PrescriptionOrderDetails {
  @ApiProperty({
    enum: ['PRESCRIPTION'],
    description: 'Tipo de transacción: receta médica',
  })
  transactionType: 'PRESCRIPTION';

  @ApiProperty({ description: 'ID de la sucursal' })
  branchId: string;

  @ApiProperty({ description: 'ID del personal' })
  staffId: string;

  @ApiProperty({ type: Date, description: 'Fecha de la receta' })
  prescriptionDate: Date;

  @ApiProperty({
    type: [ProductMovement],
    description: 'Productos de la venta',
  })
  products?: ProductMovement[];

  @ApiProperty({
    type: [BaseServiceItem],
    description: 'Servicios',
  })
  services?: BaseServiceItem[];

  @ApiProperty({
    type: TransactionDetails,
    description: 'Detalles de la transacción',
  })
  transactionDetails: TransactionDetails;
}

export class MedicalPrescriptionMetadata extends BaseOrderMetadata {
  @ApiProperty({
    type: PrescriptionOrderDetails,
    description: 'Detalles de la orden de receta médica',
  })
  orderDetails: PrescriptionOrderDetails;
}

// Appointment Details Metadata (Specific)
//--------------------------
export class AppointmentDetailsMetadata {
  @ApiProperty({ required: false, description: 'Estado de la cita médica' })
  appointmentStatus?: string;
}
