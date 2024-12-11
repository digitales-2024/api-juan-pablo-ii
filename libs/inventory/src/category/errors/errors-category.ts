import { ErrorMessages } from 'src/common/error-handlers/service-error.handler';

// Mensajes de error para el módulo de categorías
export const categoryErrorMessages: ErrorMessages = {
  notFound: 'Categoría no encontrada',
  alreadyExists: 'La categoría ya existe',
  invalidData: 'Datos de la categoría inválidos',
  notActive: 'La categoría no está activa',
  alreadyActive: 'La categoría ya está activa',
  inUse: 'La categoría está en uso y no puede ser eliminada',
  invalidOperation: 'Operación inválida para la categoría',
};
