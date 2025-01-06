import { ErrorMessages } from 'src/common/error-handlers/service-error.handler';

// Mensajes de error para el módulo de movimientos
export const movementErrorMessages: ErrorMessages = {
  notFound: 'Movimiento no encontrado',
  alreadyExists: 'El movimiento ya existe',
  invalidData: 'Datos del movimiento inválidos',
  notActive: 'El movimiento no está activo',
  alreadyActive: 'El movimiento ya está activo',
  inUse: 'El movimiento está en uso y no puede ser eliminado',
  invalidOperation: 'Operación inválida para el movimiento',
};
