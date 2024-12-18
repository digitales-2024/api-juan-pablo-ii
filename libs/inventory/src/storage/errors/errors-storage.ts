import { ErrorMessages } from 'src/common/error-handlers/service-error.handler';

// Mensajes de error para el módulo de almacenes
export const storageErrorMessages: ErrorMessages = {
  notFound: 'Almacén no encontrado',
  alreadyExists: 'El almacén ya existe',
  invalidData: 'Datos del almacén inválidos',
  notActive: 'El almacén no está activo',
  alreadyActive: 'El almacén ya está activo',
  inUse: 'El almacén está en uso y no puede ser eliminado',
  invalidOperation: 'Operación inválida para el almacén',
};
