import { ErrorMessages } from 'src/common/error-handlers/service-error.handler';

export const appointmentTypeErrorMessages: ErrorMessages = {
  notFound: 'Tipo de cita no encontrado',
  alreadyExists: 'El tipo de cita ya existe',
  invalidData: 'Datos del tipo de cita inválidos',
  notActive: 'El tipo de cita no está activo',
  alreadyActive: 'El tipo de cita ya está activo',
  inUse: 'El tipo de cita está en uso y no puede ser eliminado',
  invalidOperation: 'Operación inválida para el tipo de cita',
};
