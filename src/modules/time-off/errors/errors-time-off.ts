import { ErrorMessages } from "src/common/error-handlers/service-error.handler";

export const timeOffErrorMessages: ErrorMessages = {
  notFound: 'Solicitud de tiempo libre no encontrada',
  alreadyExists: 'La solicitud de tiempo libre ya existe',
  invalidData: 'Datos de la solicitud de tiempo libre inválidos',
  notActive: 'La solicitud de tiempo libre no está activa',
  alreadyActive: 'La solicitud de tiempo libre ya está activa',
  inUse: 'La solicitud de tiempo libre está en uso y no puede ser eliminada',
  invalidOperation: 'Operación inválida para la solicitud de tiempo libre',
}; 