import { ErrorMessages } from 'src/common/error-handlers/service-error.handler';

// Mensajes de error para el módulo de tipos de movimiento
export const typeMovementErrorMessages: ErrorMessages = {
  notFound: 'Tipo de movimiento no encontrado',
  alreadyExists: 'El tipo de movimiento ya existe',
  invalidData: 'Datos del tipo de movimiento inválidos',
  notActive: 'El tipo de movimiento no está activo',
  alreadyActive: 'El tipo de movimiento ya está activo',
  inUse: 'El tipo de movimiento está en uso y no puede ser eliminado',
  invalidOperation: 'Operación inválida para el tipo de movimiento',
};
