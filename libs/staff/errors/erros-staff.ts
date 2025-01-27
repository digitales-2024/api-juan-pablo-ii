import { ErrorMessages } from 'src/common/error-handlers/service-error.handler';

export const staffErrorMessages: ErrorMessages = {
  notFound: 'Personal no encontrado',
  alreadyExists: 'El personal ya existe',
  invalidData: 'Datos del personal inválidos',
  notActive: 'El personal no está activo',
  alreadyActive: 'El personal ya está activo',
  inUse: 'El personal está en uso y no puede ser eliminado',
  invalidOperation: 'Operación inválida para el personal',
};

// errors-especialidad.ts
export const staffTypeErrorMessages: ErrorMessages = {
  notFound: 'Tipo de personal no encontrado',
  alreadyExists: 'El tipo de personal ya existe',
  invalidData: 'Datos del tipo de personal inválidos',
  notActive: 'El tipo de personal no está activo',
  alreadyActive: 'El tipo de personal ya está activa',
  inUse: 'El tipo de personal está en uso y no puede ser eliminado',
  invalidOperation: 'Operación inválida para el tipo de personal',
};
