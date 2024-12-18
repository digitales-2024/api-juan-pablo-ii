import { ErrorMessages } from 'src/common/error-handlers/service-error.handler';

// Mensajes de error para el módulo de ingresos
export const incomingErrorMessages: ErrorMessages = {
  notFound: 'Ingreso no encontrado',
  alreadyExists: 'El ingreso ya existe',
  invalidData: 'Datos del ingreso inválidos',
  notActive: 'El ingreso no está activo',
  alreadyActive: 'El ingreso ya está activo',
  inUse: 'El ingreso está en uso y no puede ser eliminado',
  invalidOperation: 'Operación inválida para el ingreso',
};
