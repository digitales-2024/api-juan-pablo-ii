import { ErrorMessages } from 'src/common/error-handlers/service-error.handler';

export const branchErrorMessages: ErrorMessages = {
  notFound: 'Sucursal no encontrada',
  alreadyExists: 'La sucursal ya existe',
  invalidData: 'Datos de la sucursal inválidos',
  notActive: 'La sucursal no está activa',
  alreadyActive: 'La sucursal ya está activa',
  inUse: 'La sucursal está en uso y no puede ser eliminada',
  invalidOperation: 'Operación inválida para la sucursal',
};
