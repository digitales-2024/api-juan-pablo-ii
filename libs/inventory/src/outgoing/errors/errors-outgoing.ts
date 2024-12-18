import { ErrorMessages } from 'src/common/error-handlers/service-error.handler';

// Mensajes de error para el módulo de salidas
export const outgoingErrorMessages: ErrorMessages = {
  notFound: 'Salida no encontrada',
  alreadyExists: 'La salida ya existe',
  invalidData: 'Datos de la salida inválidos',
  notActive: 'La salida no está activa',
  alreadyActive: 'La salida ya está activa',
  inUse: 'La salida está en uso y no puede ser eliminada',
  invalidOperation: 'Operación inválida para la salida',
};
