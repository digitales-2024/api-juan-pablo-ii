import { ErrorMessages } from 'src/common/error-handlers/service-error.handler';


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
