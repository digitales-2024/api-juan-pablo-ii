import { BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { handleException } from '@login/login/utils';

/**
 * Define tipos de acciones que pueden generar errores
 */
export type ServiceAction =
  | 'creating'
  | 'updating'
  | 'getting'
  | 'deleting'
  | 'reactivating'
  | 'deactivating'
  | 'activating'
  | 'processing';

/**
 * Interface para mensajes de error de cada entidad
 */
export interface ErrorMessages {
  notFound: string;
  alreadyExists: string;
  invalidData: string;
  notActive: string;
  alreadyActive: string;
  inUse: string;
  invalidOperation: string;
  [key: string]: string;
}

/**
 * Manejador base de errores que puede ser utilizado por cualquier entidad
 */
export class BaseErrorHandler {
  constructor(
    private readonly logger: Logger,
    private readonly entityName: string,
    private readonly errorMessages: ErrorMessages,
  ) {}

  handleError(error: Error, action: ServiceAction): never {
    const logMessage = `Error ${action} ${this.entityName}`;

    if (
      error instanceof BadRequestException ||
      error instanceof NotFoundException
    ) {
      this.logger.warn(`${logMessage}: ${error.message}`);
      throw new BadRequestException(this.getSpanishMessage(error.message));
    }

    this.logger.error(`${logMessage}: ${error.message}`, error.stack);
    handleException(error, this.getSpanishErrorMessage(action));
  }

  handleValidationError(error: Error, context: string): never {
    const logMessage = `Validation error in ${this.entityName}`;

    if (error instanceof BadRequestException) {
      this.logger.warn(`${logMessage}: ${error.message}`);
      throw new BadRequestException(this.getSpanishMessage(error.message));
    }

    this.logger.error(`${logMessage}: ${error.message}`, error.stack);
    handleException(error, `Error de validación en ${context}`);
  }

  handleBatchError(error: Error, action: ServiceAction): never {
    const logMessage = `Error in batch ${action} ${this.entityName}`;

    if (
      error instanceof BadRequestException ||
      error instanceof NotFoundException
    ) {
      this.logger.warn(`${logMessage}: ${error.message}`);
      throw new BadRequestException(this.getSpanishMessage(error.message));
    }

    this.logger.error(`${logMessage}: ${error.message}`, error.stack);
    handleException(
      error,
      `Error al procesar múltiples ${this.getEntityNameInSpanish()}`,
    );
  }

  private getSpanishMessage(originalMessage: string): string {
    if (originalMessage.includes('not found'))
      return this.errorMessages.notFound;
    if (originalMessage.includes('already exists'))
      return this.errorMessages.alreadyExists;
    if (originalMessage.includes('invalid'))
      return this.errorMessages.invalidData;
    if (originalMessage.includes('not active'))
      return this.errorMessages.notActive;
    if (originalMessage.includes('already active'))
      return this.errorMessages.alreadyActive;
    if (originalMessage.includes('in use')) return this.errorMessages.inUse;
    return 'Error al procesar la solicitud';
  }

  private getSpanishErrorMessage(action: ServiceAction): string {
    const actionMessages = {
      creating: 'crear',
      updating: 'actualizar',
      getting: 'obtener',
      deleting: 'eliminar',
      reactivating: 'reactivar',
      deactivating: 'desactivar',
      activating: 'activar',
      processing: 'procesar',
    };

    return `Error al ${actionMessages[action]} ${this.getEntityNameInSpanish()}`;
  }

  private getEntityNameInSpanish(): string {
    return this.entityName.toLowerCase();
  }
}

// Mensajes de error para cada entidad
export const serviceErrorMessages: ErrorMessages = {
  notFound: 'Servicio no encontrado',
  alreadyExists: 'El servicio ya existe',
  invalidData: 'Datos del servicio inválidos',
  notActive: 'El servicio no está activo',
  alreadyActive: 'El servicio ya está activo',
  inUse: 'El servicio está en uso y no puede ser eliminado',
  invalidOperation: 'Operación inválida para el servicio',
};

export const serviceTypeErrorMessages: ErrorMessages = {
  notFound: 'Tipo de servicio no encontrado',
  alreadyExists: 'El tipo de servicio ya existe',
  invalidData: 'Datos del tipo de servicio inválidos',
  notActive: 'El tipo de servicio no está activo',
  alreadyActive: 'El tipo de servicio ya está activo',
  inUse: 'El tipo de servicio está en uso y no puede ser eliminado',
  invalidOperation: 'Operación inválida para el tipo de servicio',
};

// Mensajes de error para el módulo de sucursales
export const branchErrorMessages: ErrorMessages = {
  notFound: 'Sucursal no encontrada',
  alreadyExists: 'La sucursal ya existe',
  invalidData: 'Datos de la sucursal inválidos',
  notActive: 'La sucursal no está activa',
  alreadyActive: 'La sucursal ya está activa',
  inUse: 'La sucursal está en uso y no puede ser eliminada',
  invalidOperation: 'Operación inválida para la sucursal',
};

// Registro de todos los mensajes de error por entidad
export const entityErrorMessages = {
  service: serviceErrorMessages,
  serviceType: serviceTypeErrorMessages,
  branch: branchErrorMessages,
  // Para agregar un nuevo módulo:
  // 1. Crear constante de mensajes de error siguiendo la interfaz ErrorMessages
  // 2. Agregar aquí con una clave apropiada
  // Ejemplo:
  // inventory: inventoryErrorMessages,
} as const;

// Helper de TypeScript para obtener tipos de entidad
export type EntityType = keyof typeof entityErrorMessages;

// Función auxiliar para obtener mensajes de error de una entidad
export function getErrorMessagesForEntity(entity: EntityType): ErrorMessages {
  return entityErrorMessages[entity];
}
