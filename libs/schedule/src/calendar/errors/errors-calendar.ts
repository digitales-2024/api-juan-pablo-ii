import { ErrorMessages } from 'src/common/error-handlers/service-error.handler';

// Mensajes de error para el módulo de calendario
export const calendarErrorMessages: ErrorMessages = {
  notFound: 'Calendario no encontrado',
  alreadyExists: 'El calendario ya existe',
  invalidData: 'Datos del calendario inválidos',
  notActive: 'El calendario no está activo',
  alreadyActive: 'El calendario ya está activo',
  inUse: 'El calendario está en uso y no puede ser eliminado',
  invalidOperation: 'Operación inválida para el calendario',
};
