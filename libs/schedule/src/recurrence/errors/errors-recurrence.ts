import { ErrorMessages } from 'src/common/error-handlers/service-error.handler';

// Mensajes de error para el módulo de recurrencias
export const recurrenceErrorMessages: ErrorMessages = {
  notFound: 'Recurrencia no encontrada',
  alreadyExists: 'La recurrencia ya existe',
  invalidData: 'Datos de la recurrencia inválidos',
  notActive: 'La recurrencia no está activa',
  alreadyActive: 'La recurrencia ya está activa',
  inUse: 'La recurrencia está en uso y no puede ser eliminada',
  invalidOperation: 'Operación inválida para la recurrencia',
};
