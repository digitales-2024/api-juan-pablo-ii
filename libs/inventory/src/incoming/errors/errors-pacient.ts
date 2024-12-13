import { ErrorMessages } from 'src/common/error-handlers/service-error.handler';

// Mensajes de error para el módulo de pacientes
export const pacientErrorMessages: ErrorMessages = {
  notFound: 'Paciente no encontrado',
  alreadyExists: 'El paciente ya existe',
  invalidData: 'Datos del paciente inválidos',
  notActive: 'El paciente no está activo',
  alreadyActive: 'El paciente ya está activo',
  inUse: 'El paciente está en uso y no puede ser eliminado',
  invalidOperation: 'Operación inválida para el paciente',
};
