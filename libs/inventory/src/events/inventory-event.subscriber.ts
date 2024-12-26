import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { OrderType } from '@pay/pay/interfaces/order.types';
import { TypeMovementRepository } from '../type-movement/repositories/type-movement.repository';
import { MovementRepository } from '../movement/repositories/movement.repository';
import { Order } from '@pay/pay/entities/order.entity';
import { CompensationService } from '../compensation/compensation.service';
import { IncomingRepository } from '../incoming/repositories/incoming.repository';
import { OutgoingRepository } from '../outgoing/repositories/outgoing.repository';
import {
  ProductSaleMetadata,
  ProductPurchaseMetadata,
} from 'src/modules/billing/interfaces/metadata.interfaces';
import { StorageService } from '../storage/services/storage.service';

/**
 * Suscriptor de eventos para el manejo de inventario.
 * Gestiona los movimientos de inventario cuando se completan las órdenes.
 * @class InventoryEventSubscriber
 */
@Injectable()
export class InventoryEventSubscriber {
  /** Logger para el registro de eventos y errores */
  private readonly logger = new Logger(InventoryEventSubscriber.name);

  /**
   * Constructor del suscriptor de eventos de inventario
   * @param {MovementRepository} movementRepository - Repositorio para gestionar movimientos
   * @param {TypeMovementRepository} typeMovementRepository - Repositorio para tipos de movimientos
   * @param {StockService} stockService - Servicio para gestionar el stock
   * @param {CompensationService} compensationService - Servicio para compensación de errores
   * @param {IncomingRepository} incomingRepository - Repositorio para entradas
   * @param {OutgoingRepository} outgoingRepository - Repositorio para salidas
   */
  constructor(
    private readonly movementRepository: MovementRepository,
    private readonly typeMovementRepository: TypeMovementRepository,
    private readonly storageService: StorageService,
    private readonly compensationService: CompensationService,
    private readonly incomingRepository: IncomingRepository,
    private readonly outgoingRepository: OutgoingRepository,
  ) {}

  /**
   * Maneja el evento de orden completada
   * @param {Object} payload - Datos de la orden completada
   * @param {Order} payload.order - Orden completada
   * @param {Object} payload.metadata - Metadatos de la verificación del pago
   * @throws {Error} Si ocurre un error durante el procesamiento
   */
  @OnEvent('order.completed')
  async handleOrderCompleted(payload: {
    order: Order;
    metadata?: {
      paymentId: string;
      verifiedBy: string;
      verificationDate: Date;
    };
  }) {
    this.logger.log(
      `Received order.completed event for order: ${payload.order.id}`,
    );
    this.logger.log(`Payment verification metadata:`, payload.metadata);

    try {
      const { order } = payload;

      if (!this.shouldProcessInventory(order)) {
        this.logger.log(
          `Order ${order.id} does not require inventory processing`,
        );
        return;
      }
      this.logger.log(
        `Starting inventory movement processing for order ${order.id}`,
      );
      await this.processInventoryMovements(order);
      this.logger.log(
        `Successfully processed inventory movements for order ${order.id}`,
      );
    } catch (error) {
      this.logger.error(
        `Error processing inventory movements for order ${payload.order.id}:`,
        error.stack,
      );
      this.logger.log(
        `Initiating compensation flow for failed order ${payload.order.id}`,
      );
      await this.compensationService.compensateFailedMovements(payload.order);
    }
  }

  /**
   * Determina si una orden debe procesar cambios en el inventario
   * @param {Order} order - Orden a evaluar
   * @returns {boolean} True si la orden requiere procesamiento de inventario
   * @private
   */
  private shouldProcessInventory(order: Order): boolean {
    return [
      OrderType.PRODUCT_SALE_ORDER,
      OrderType.PRODUCT_PURCHASE_ORDER,
    ].includes(order.type as OrderType);
  }

  /**
   * Procesa los movimientos de inventario para una orden
   * @param {Order} order - Orden a procesar
   * @throws {Error} Si la orden no tiene tipo de movimiento o ID de almacén
   * @private
   */
  private async processInventoryMovements(order: Order) {
    if (!order.movementTypeId) {
      throw new Error(`Order ${order.id} has no movement type ID`);
    }

    const isIncoming = order.type === OrderType.PRODUCT_PURCHASE_ORDER;
    this.logger.log(
      `Processing ${isIncoming ? 'incoming' : 'outgoing'} movement`,
    );

    // Asegurar que el metadata sea un objeto
    let metadata: ProductSaleMetadata | ProductPurchaseMetadata;
    try {
      metadata =
        typeof order.metadata === 'string'
          ? JSON.parse(order.metadata)
          : order.metadata;
    } catch (error) {
      throw new Error(
        `Invalid metadata format for order ${order.id}: ${error.message}`,
      );
    }

    // Validar la estructura del metadata y extraer el storageId
    const storageId = metadata?.orderDetails?.storageId;
    this.logger.debug('Metadata structure:', JSON.stringify(metadata, null, 2));
    this.logger.debug('Storage ID found:', storageId);

    if (!storageId) {
      throw new Error(
        `Missing required storageId in order ${order.id}. Metadata: ${JSON.stringify(metadata)}`,
      );
    }

    this.logger.log(
      `Updating movement type ${order.movementTypeId} to active state`,
    );
    await this.typeMovementRepository.update(order.movementTypeId, {
      state: true,
    });

    // Crear el registro de entrada o salida
    this.logger.log(
      `Creating ${isIncoming ? 'incoming' : 'outgoing'} record for storage ${storageId}`,
    );
    const record = isIncoming
      ? await this.incomingRepository.create({
          name: `Purchase Order ${order.code}`,
          description: `Purchase incoming for order ${order.id}`,
          storageId: storageId,
          date: new Date(),
          state: true,
          referenceId: order.id,
        })
      : await this.outgoingRepository.create({
          name: `Sale Order ${order.code}`,
          description: `Sale outgoing for order ${order.id}`,
          storageId: storageId,
          date: new Date(),
          state: true,
          referenceId: order.id,
        });

    // Validar y procesar los productos
    const products = metadata?.orderDetails?.products;
    if (!Array.isArray(products) || products.length === 0) {
      throw new Error(
        `No valid products found in order ${order.id}. Products: ${JSON.stringify(products)}`,
      );
    }

    for (const product of products) {
      this.logger.debug('Processing product:', {
        productId: product.productId,
        quantity: product.quantity,
        orderId: order.id,
      });

      await this.createMovement(order, product, isIncoming, record.id);

      if (order.type === OrderType.PRODUCT_SALE_ORDER) {
        await this.validateStock(order, product);
      }
    }
  }
  /**
   * Crea un nuevo movimiento en el inventario
   * @param {Order} order - Orden relacionada al movimiento
   * @param {Object} product - Producto involucrado en el movimiento
   * @param {boolean} isIncoming - Indica si es un movimiento de entrada
   * @param {string} recordId - ID del registro de entrada/salida
   * @private
   */
  private async createMovement(
    order: Order,
    product: { productId: string; quantity: number },
    isIncoming: boolean,
    recordId: string,
  ) {
    await this.movementRepository.create({
      movementTypeId: order.movementTypeId,
      productId: product.productId,
      quantity: isIncoming ? product.quantity : -product.quantity,
      date: new Date(),
      state: true,
      incomingId: isIncoming ? recordId : null,
      outgoingId: !isIncoming ? recordId : null,
    });
  }

  /**
   * Valida el stock después de un movimiento
   * @param {Order} order - Orden relacionada
   * @param {Object} product - Producto a validar
   * @throws {Error} Si el stock resultante es negativo
   * @private
   */
  private async validateStock(
    order: Order,
    product: { productId: string; quantity: number },
  ) {
    // Asegurar que el metadata sea un objeto
    let metadata: ProductSaleMetadata | ProductPurchaseMetadata;
    try {
      metadata =
        typeof order.metadata === 'string'
          ? JSON.parse(order.metadata)
          : order.metadata;

      // Obtener el storageId del metadata
      const storageId = metadata?.orderDetails?.storageId;
      if (!storageId) {
        throw new Error(`Missing storageId in metadata for order ${order.id}`);
      }

      this.logger.debug('Validating stock for:', {
        storageId,
        productId: product.productId,
        quantity: product.quantity,
      });

      const stock = await this.storageService.getStockByStorageAndProduct(
        storageId,
        product.productId,
      );

      if (stock < 0) {
        throw new Error(
          `Invalid stock movement: Negative stock for product ${product.productId} in storage ${storageId}`,
        );
      }
    } catch (error) {
      this.logger.error('Error validating stock:', {
        orderId: order.id,
        productId: product.productId,
        error: error.message,
        metadata: metadata,
      });
      throw error;
    }
  }
}
