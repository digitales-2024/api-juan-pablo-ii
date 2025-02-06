import { ErrorMessages } from 'src/common/error-handlers/service-error.handler';

export const staffScheduleErrorMessages: ErrorMessages = {
  notFound: 'Horario del personal no encontrado',
  alreadyExists: 'El horario del personal ya existe',
  invalidData: 'Datos del horario del personal inválidos',
  notActive: 'El horario del personal no está activo',
  alreadyActive: 'El horario del personal ya está activo',
  inUse: 'El horario del personal está en uso y no puede ser eliminado',
  invalidOperation: 'Operación inválida para el horario del personal',
};
