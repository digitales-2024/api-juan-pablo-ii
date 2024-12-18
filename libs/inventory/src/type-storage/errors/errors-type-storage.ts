import { ErrorMessages } from 'src/common/error-handlers/service-error.handler';

// Mensajes de error para el módulo de tipos de almacenamiento
export const typeStorageErrorMessages: ErrorMessages = {
  notFound: 'Tipo de almacenamiento no encontrado',
  alreadyExists: 'El tipo de almacenamiento ya existe',
  invalidData: 'Datos del tipo de almacenamiento inválidos',
  notActive: 'El tipo de almacenamiento no está activo',
  alreadyActive: 'El tipo de almacenamiento ya está activo',
  inUse: 'El tipo de almacenamiento está en uso y no puede ser eliminado',
  invalidOperation: 'Operación inválida para el tipo de almacenamiento',
};
