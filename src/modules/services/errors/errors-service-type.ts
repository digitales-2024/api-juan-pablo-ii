import { ErrorMessages } from 'src/common/error-handlers/service-error.handler';

export const serviceTypeErrorMessages: ErrorMessages = {
  notFound: 'Tipo de servicio no encontrado',
  alreadyExists: 'El tipo de servicio ya existe',
  invalidData: 'Datos del tipo de servicio inválidos',
  notActive: 'El tipo de servicio no está activo',
  alreadyActive: 'El tipo de servicio ya está activo',
  inUse: 'El tipo de servicio está en uso y no puede ser eliminado',
  invalidOperation: 'Operación inválida para el tipo de servicio',
};
