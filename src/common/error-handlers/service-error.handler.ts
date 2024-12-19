import { BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { handleException } from '@login/login/utils';
import { appointmentTypeErrorMessages } from 'src/modules/appointments/errors/errors-appointments';
import { branchErrorMessages } from 'src/modules/branch/errors/errors-branch';
import { serviceTypeErrorMessages } from 'src/modules/services/errors/errors-service-type';
import { serviceErrorMessages } from 'src/modules/services/errors/errors-service';
import { pacientErrorMessages } from '@pacient/pacient/pacient/errors/errors-pacient';
import { calendarErrorMessages } from '@schedule/schedule/calendar/errors/errors-calendar';
import { eventErrorMessages } from '@schedule/schedule/event/errors/errors-event';
import { recurrenceErrorMessages } from '@schedule/schedule/recurrence/errors/errors-recurrence';
import { recipeErrorMessages } from '@pacient/pacient/recipe/errors/errors-recipe';
import { upHistoryErrorMessages } from '@pacient/pacient/update-history/errors/errors-up-history';
import { historyErrorMessages } from '@pacient/pacient/history/errors/errors-history';
import { categoryErrorMessages } from '@inventory/inventory/category/errors/errors-category';
import { productErrorMessages } from '@inventory/inventory/product/errors/errors-product';
import { typeProductErrorMessages } from '@inventory/inventory/type-product/errors/errors-type-product';
import { typeStorageErrorMessages } from '@inventory/inventory/type-storage/errors/errors-type-storage';
import { storageErrorMessages } from '@inventory/inventory/storage/errors/errors-storage';
import { typeMovementErrorMessages } from '@inventory/inventory/type-movement/errors/errors-type-movement';
import { movementErrorMessages } from '@inventory/inventory/movement/errors/errors-movement';
import { paymentErrorMessages } from '@pay/pay/errors/errors-payment';
import { orderErrorMessages } from '@pay/pay/errors/errors-order';
import { billingErrorMessages } from 'src/modules/billing/errors/errors-billing';

export type ServiceAction =
  | 'creating'
  | 'updating'
  | 'getting'
  | 'deleting'
  | 'reactivating'
  | 'deactivating'
  | 'activating'
  | 'processing'
  | 'verifying'
  | 'rejecting';

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
      const message = this.getDefaultOrCustomMessage(error.message);
      throw new BadRequestException(message);
    }

    this.logger.error(`${logMessage}: ${error.message}`, error.stack);
    handleException(error, this.getSpanishErrorMessage(action));
  }

  handleValidationError(error: Error, context: string): never {
    const logMessage = `Validation error in ${this.entityName}`;

    if (
      error instanceof BadRequestException ||
      error instanceof NotFoundException
    ) {
      this.logger.warn(`${logMessage}: ${error.message}`);
      const message = this.getDefaultOrCustomMessage(error.message);
      throw new BadRequestException(message);
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
      const message = this.getDefaultOrCustomMessage(error.message);
      throw new BadRequestException(message);
    }

    this.logger.error(`${logMessage}: ${error.message}`, error.stack);
    handleException(
      error,
      `Error al procesar múltiples ${this.getEntityNameInSpanish()}`,
    );
  }

  private getDefaultOrCustomMessage(message: string): string {
    if (message === 'Bad Request' || message === 'Not Found') {
      return this.errorMessages.invalidData;
    }
    return this.getSpanishMessage(message);
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
    return originalMessage;
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
      verifying: 'verificar',
      rejecting: 'rechazar',
    };

    return `Error al ${actionMessages[action]} ${this.getEntityNameInSpanish()}`;
  }

  private getEntityNameInSpanish(): string {
    return this.entityName.toLowerCase();
  }
}

// Mensajes de error para cada entidad

// Registro de todos los mensajes de error por entidad
export const entityErrorMessages = {
  service: serviceErrorMessages,
  serviceType: serviceTypeErrorMessages,
  branch: branchErrorMessages,
  appointmentType: appointmentTypeErrorMessages,
  paciente: pacientErrorMessages,
  calendar: calendarErrorMessages,
  event: eventErrorMessages,
  recurrence: recurrenceErrorMessages,
  recipe: recipeErrorMessages,
  updateHistory: upHistoryErrorMessages,
  history: historyErrorMessages,
  category: categoryErrorMessages,
  typeProduc: typeProductErrorMessages,
  product: productErrorMessages,
  typeStorage: typeStorageErrorMessages,
  storage: storageErrorMessages,
  typeMovement: typeMovementErrorMessages,
  movement: movementErrorMessages,
  payment: paymentErrorMessages,
  order: orderErrorMessages,
  billing: billingErrorMessages,
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
