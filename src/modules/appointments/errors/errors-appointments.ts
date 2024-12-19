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

export const appointmentErrorMessages: ErrorMessages = {
  notFound: 'Cita médica no encontrada',
  alreadyExists: 'Ya existe una cita en este horario',
  invalidData: 'Datos de la cita médica inválidos',
  notActive: 'La cita médica no está activa',
  alreadyActive: 'La cita médica ya está activa',
  inUse: 'La cita médica está en uso y no puede ser eliminada',
  invalidOperation: 'Operación inválida para la cita médica',
  unavailableTime: 'El horario seleccionado no está disponible',
  invalidStatus: 'Estado de cita inválido',
};
