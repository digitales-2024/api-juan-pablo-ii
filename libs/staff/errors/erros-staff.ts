import { ErrorMessages } from 'src/common/error-handlers/service-error.handler';

export const personalErrorMessages: ErrorMessages = {
  notFound: 'Personal médico no encontrado',
  alreadyExists: 'El personal médico ya existe',
  invalidData: 'Datos del personal médico inválidos',
  notActive: 'El personal médico no está activo',
  alreadyActive: 'El personal médico ya está activo',
  inUse: 'El personal médico está en uso y no puede ser eliminado',
  invalidOperation: 'Operación inválida para el personal médico',
};

// errors-especialidad.ts
export const especialidadErrorMessages: ErrorMessages = {
  notFound: 'Especialidad no encontrada',
  alreadyExists: 'La especialidad ya existe',
  invalidData: 'Datos de la especialidad inválidos',
  notActive: 'La especialidad no está activa',
  alreadyActive: 'La especialidad ya está activa',
  inUse: 'La especialidad está en uso y no puede ser eliminada',
  invalidOperation: 'Operación inválida para la especialidad',
};
