import { ErrorMessages } from 'src/common/error-handlers/service-error.handler';

// Mensajes de error para el módulo de historias médicas
export const historyErrorMessages: ErrorMessages = {
  notFound: 'Historia médica no encontrada',
  alreadyExists: 'La historia médica ya existe',
  invalidData: 'Datos de la historia médica inválidos',
  notActive: 'La historia médica no está activa',
  alreadyActive: 'La historia médica ya está activa',
  inUse: 'La historia médica está en uso y no puede ser eliminada',
  invalidOperation: 'Operación inválida para la historia médica',
};
