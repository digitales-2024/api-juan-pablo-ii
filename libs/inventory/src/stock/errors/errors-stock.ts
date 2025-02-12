import { ErrorMessages } from 'src/common/error-handlers/service-error.handler';

// Mensajes de error para el módulo de stock
export const stockErrorMessages: ErrorMessages = {
  notFound: 'Stock no encontrado',
  alreadyExists: 'El stock ya existe',
  invalidData: 'Datos del stock inválidos',
  notActive: 'El stock no está activo',
  alreadyActive: 'El stock ya está activo',
  inUse: 'El stock está en uso y no puede ser eliminado',
  invalidOperation: 'Operación inválida para el stock',
};
