import { ErrorMessages } from 'src/common/error-handlers/service-error.handler';

export const paymentErrorMessages: ErrorMessages = {
  notFound: 'Pago no encontrado',
  alreadyExists: 'El pago ya existe',
  invalidData: 'Datos del pago inválidos',
  notActive: 'El pago no está activo',
  alreadyActive: 'El pago ya está activo',
  inUse: 'El pago está en uso y no puede ser eliminado',
  invalidOperation: 'Operación inválida para el pago',
  insufficientFunds: 'Fondos insuficientes para realizar el pago',
  invalidAmount: 'Monto de pago inválido',
  duplicatePayment: 'Ya existe un pago para esta orden',
  paymentAlreadyProcessed: 'El pago ya ha sido procesado',
  invalidStatus: 'Estado de pago inválido',
  orderNotFound: 'La orden asociada al pago no existe',
};
