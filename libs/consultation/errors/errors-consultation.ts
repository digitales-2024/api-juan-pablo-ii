import { ErrorMessages } from 'src/common/error-handlers/service-error.handler';

// Mensajes de error para el módulo de consultas
export const consultationErrorMessages: ErrorMessages = {
  notFound: 'Consulta no encontrada',
  alreadyExists: 'La consulta ya existe',
  invalidData: 'Datos de la consulta inválidos',
  notActive: 'La consulta no está activa',
  alreadyActive: 'La consulta ya está activa',
  inUse: 'La consulta está en uso y no puede ser eliminada',
  invalidOperation: 'Operación inválida para la consulta',
};
