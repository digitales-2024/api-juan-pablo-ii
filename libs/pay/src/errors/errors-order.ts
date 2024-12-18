import { ErrorMessages } from 'src/common/error-handlers/service-error.handler';

export const orderErrorMessages: ErrorMessages = {
  notFound: 'Orden no encontrada',
  alreadyExists: 'La orden ya existe',
  invalidData: 'Datos de la orden inválidos',
  notActive: 'La orden no está activa',
  alreadyActive: 'La orden ya está activa',
  inUse: 'La orden está en uso y no puede ser eliminada',
  invalidOperation: 'Operación inválida para la orden',
  generatorNotFound:
    'No se encontró un generador para el tipo de orden especificado',
  invalidOrderType: 'Tipo de orden inválido',
  invalidStatus: 'Estado de orden inválido',
};
