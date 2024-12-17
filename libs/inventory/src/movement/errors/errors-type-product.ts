import { ErrorMessages } from 'src/common/error-handlers/service-error.handler';

// Mensajes de error para el módulo de pacientes
export const typeProductErrorMessages: ErrorMessages = {
  notFound: 'Tipo de producto no encontrado',
  alreadyExists: 'El tipo de producto ya existe',
  invalidData: 'Datos del tipo de producto inválidos',
  notActive: 'El tipo de producto no está activo',
  alreadyActive: 'El tipo de producto ya está activo',
  inUse: 'El tipo de producto está en uso y no puede ser eliminado',
  invalidOperation: 'Operación inválida para el tipo de producto',
};
