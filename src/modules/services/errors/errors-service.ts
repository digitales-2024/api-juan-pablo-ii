import { ErrorMessages } from 'src/common/error-handlers/service-error.handler';

export const serviceErrorMessages: ErrorMessages = {
  notFound: 'Servicio no encontrado',
  alreadyExists: 'El servicio ya existe',
  invalidData: 'Datos del servicio inválidos',
  notActive: 'El servicio no está activo',
  alreadyActive: 'El servicio ya está activo',
  inUse: 'El servicio está en uso y no puede ser eliminado',
  invalidOperation: 'Operación inválida para el servicio',
};
