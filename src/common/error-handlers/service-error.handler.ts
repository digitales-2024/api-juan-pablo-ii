import { BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { handleException } from '@login/login/utils';

export type ServiceAction =
  | 'creating'
  | 'updating'
  | 'getting'
  | 'deleting'
  | 'reactivating'
  | 'deactivating'
  | 'activating'
  | 'processing';

export type ServiceType =
  | 'Service'
  | 'ServiceType'
  | 'User'
  | 'Client'
  | 'Product' // Ejemplo de cómo agregar un nuevo servicio
  | 'Order'; // Ejemplo de cómo agregar un nuevo servicio

interface ErrorMessages {
  notFound: string;
  alreadyExists: string;
  invalidData: string;
  notActive: string;
  alreadyActive: string;
  inUse: string;
  invalidOperation: string;
  [key: string]: string;
}

const errorMessages: Record<ServiceType, ErrorMessages> = {
  Service: {
    notFound: 'Servicio no encontrado',
    alreadyExists: 'El servicio ya existe',
    invalidData: 'Datos del servicio inválidos',
    notActive: 'El servicio no está activo',
    alreadyActive: 'El servicio ya está activo',
    inUse: 'El servicio está en uso y no puede ser eliminado',
    invalidOperation: 'Operación inválida para el servicio',
  },
  ServiceType: {
    notFound: 'Tipo de servicio no encontrado',
    alreadyExists: 'El tipo de servicio ya existe',
    invalidData: 'Datos del tipo de servicio inválidos',
    notActive: 'El tipo de servicio no está activo',
    alreadyActive: 'El tipo de servicio ya está activo',
    inUse: 'El tipo de servicio está en uso y no puede ser eliminado',
    invalidOperation: 'Operación inválida para el tipo de servicio',
  },
  User: {
    notFound: 'Usuario no encontrado',
    alreadyExists: 'El usuario ya existe',
    invalidData: 'Datos del usuario inválidos',
    notActive: 'El usuario no está activo',
    alreadyActive: 'El usuario ya está activo',
    inUse: 'El usuario está en uso y no puede ser eliminado',
    invalidOperation: 'Operación inválida para el usuario',
  },
  Client: {
    notFound: 'Cliente no encontrado',
    alreadyExists: 'El cliente ya existe',
    invalidData: 'Datos del cliente inválidos',
    notActive: 'El cliente no está activo',
    alreadyActive: 'El cliente ya está activo',
    inUse: 'El cliente está en uso y no puede ser eliminado',
    invalidOperation: 'Operación inválida para el cliente',
  },
  // Ejemplo de mensajes para un nuevo servicio
  Product: {
    notFound: 'Producto no encontrado',
    alreadyExists: 'El producto ya existe',
    invalidData: 'Datos del producto inválidos',
    notActive: 'El producto no está activo',
    alreadyActive: 'El producto ya está activo',
    inUse: 'El producto está en uso y no puede ser eliminado',
    invalidOperation: 'Operación inválida para el producto',
  },
  Order: {
    notFound: 'Orden no encontrada',
    alreadyExists: 'La orden ya existe',
    invalidData: 'Datos de la orden inválidos',
    notActive: 'La orden no está activa',
    alreadyActive: 'La orden ya está activa',
    inUse: 'La orden está en uso y no puede ser eliminada',
    invalidOperation: 'Operación inválida para la orden',
  },
};

export class ServiceErrorHandler {
  constructor(
    private readonly logger: Logger,
    private readonly serviceName: ServiceType,
  ) {}

  /**
   * Maneja errores para operaciones CRUD básicas
   */
  handleError(error: Error, action: ServiceAction): never {
    const logMessage = `Error ${action} ${this.serviceName}`;

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

  /**
   * Maneja errores específicamente para operaciones de búsqueda
   */
  handleFindError(error: Error): never {
    const logMessage = `Error retrieving ${this.serviceName}`;

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
      `Error al obtener ${this.getServiceNameInSpanish()}`,
    );
  }

  /**
   * Maneja errores para operaciones en lote
   */
  handleBatchError(error: Error, action: ServiceAction): never {
    const logMessage = `Error in batch ${action} ${this.serviceName}`;

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
      `Error al procesar múltiples ${this.getServiceNameInSpanish()}`,
    );
  }

  /**
   * Maneja errores de validación específicos
   */
  handleValidationError(error: Error, context: string): never {
    const logMessage = `Validation error in ${this.serviceName}`;

    if (error instanceof BadRequestException) {
      this.logger.warn(`${logMessage}: ${error.message}`);
      throw new BadRequestException(this.getSpanishMessage(error.message));
    }

    this.logger.error(`${logMessage}: ${error.message}`, error.stack);
    handleException(error, `Error de validación en ${context}`);
  }

  /**
   * Obtiene el mensaje de error en español basado en el mensaje original
   */
  private getSpanishMessage(originalMessage: string): string {
    const messages = errorMessages[this.serviceName];

    if (originalMessage.includes('not found')) {
      return messages.notFound;
    }
    if (originalMessage.includes('already exists')) {
      return messages.alreadyExists;
    }
    if (originalMessage.includes('invalid')) {
      return messages.invalidData;
    }
    if (originalMessage.includes('not active')) {
      return messages.notActive;
    }
    if (originalMessage.includes('already active')) {
      return messages.alreadyActive;
    }
    if (originalMessage.includes('in use')) {
      return messages.inUse;
    }

    // Mensaje genérico si no hay mapeo específico
    return `Error al procesar la solicitud`;
  }

  /**
   * Obtiene el mensaje de error genérico en español según la acción
   */
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

    return `Error al ${actionMessages[action]} ${this.getServiceNameInSpanish()}`;
  }

  /**
   * Obtiene el nombre del servicio en español
   */
  private getServiceNameInSpanish(): string {
    const serviceNames = {
      Service: 'servicio',
      ServiceType: 'tipo de servicio',
      User: 'usuario',
      Client: 'cliente',
      Product: 'producto',
      Order: 'orden',
    };

    return serviceNames[this.serviceName] || this.serviceName.toLowerCase();
  }
}
