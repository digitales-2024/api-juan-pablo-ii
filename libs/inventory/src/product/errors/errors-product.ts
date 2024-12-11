import { ErrorMessages } from 'src/common/error-handlers/service-error.handler';

// Mensajes de error para el módulo de productos
export const productErrorMessages: ErrorMessages = {
  notFound: 'Producto no encontrado',
  alreadyExists: 'El producto ya existe',
  invalidData: 'Datos del producto inválidos',
  notActive: 'El producto no está activo',
  alreadyActive: 'El producto ya está activo',
  inUse: 'El producto está en uso y no puede ser eliminado',
  invalidOperation: 'Operación inválida para el producto',
};
