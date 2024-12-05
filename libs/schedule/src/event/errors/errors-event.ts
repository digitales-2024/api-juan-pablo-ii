import { ErrorMessages } from 'src/common/error-handlers/service-error.handler';

// Mensajes de error para el módulo de eventos
export const eventErrorMessages: ErrorMessages = {
  notFound: 'Evento no encontrado',
  alreadyExists: 'El evento ya existe',
  invalidData: 'Datos del evento inválidos',
  notActive: 'El evento no está activo',
  alreadyActive: 'El evento ya está activo',
  inUse: 'El evento está en uso y no puede ser eliminado',
  invalidOperation: 'Operación inválida para el evento',
};
