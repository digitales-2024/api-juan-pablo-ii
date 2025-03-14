import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { OrderType } from '@pay/pay/interfaces/order.types';
import { Order } from '@pay/pay/entities/order.entity';
import { CompensationService } from '../compensation/compensation.service';
import { ProductMovement } from 'src/modules/billing/interfaces/metadata.interfaces';
import { StockRepository } from '../stock/repositories/stock.repository';
import { UserData } from '@login/login/interfaces';
import { CreateOutgoingDtoStorage } from '../outgoing/dto/create-outgoingStorage.dto';
import { OutgoingService } from '../outgoing/services/outgoing.service';

// Interfaz para los productos en el metadata de la orden
// interface OrderProduct {
//   id: string;
//   name: string;
//   quantity: number;
//   price: number;
//   subtotal: number;
//   storageId: string;
// }

@Injectable()
export class InventoryEventSubscriber {
  private readonly logger = new Logger(InventoryEventSubscriber.name);

  constructor(
    private readonly stockRepository: StockRepository,
    private readonly compensationService: CompensationService,
    private readonly outgoingService: OutgoingService,
  ) { }

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

    if (payload.metadata) {
      this.logger.log(`Payment verification metadata:`);
      this.logger.log(`Object:`, payload.metadata);
    }

    try {
      const { order, metadata } = payload;
      const userId = metadata?.verifiedBy;

      if (!this.shouldProcessInventory(order)) {
        this.logger.log(
          `Order ${order.id} does not require inventory processing`,
        );
        return;
      }
      this.logger.log(
        `Starting inventory movement processing for order ${order.id}`,
      );
      await this.processInventoryMovements(order, userId);
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

  private shouldProcessInventory(order: Order): boolean {
    return [
      OrderType.PRODUCT_SALE_ORDER,
      OrderType.MEDICAL_PRESCRIPTION_ORDER,
    ].includes(order.type as OrderType);
  }

  private async processInventoryMovements(order: Order, userId: string) {
    // Procesamos órdenes de venta (outgoing) y prescripciones médicas
    if (order.type === OrderType.PRODUCT_SALE_ORDER) {
      this.logger.log(`Processing product sale order ${order.id}`);
      await this.processProductSaleOrder(order, userId);
    } else if (order.type === OrderType.MEDICAL_PRESCRIPTION_ORDER) {
      this.logger.log(`Processing medical prescription order ${order.id}`);

      // Ahora procesamos las prescripciones médicas directamente aquí
      await this.processMedicalPrescriptionOrder(order, userId);
    } else {
      this.logger.log(
        `Order ${order.id} is not a supported order type for inventory, skipping inventory processing`,
      );
      return;
    }
  }

  /**
   * Procesa una orden de venta de productos
   */
  private async processProductSaleOrder(order: Order, userId: string) {
    this.logger.log(`Processing outgoing movement`);

    let metadata: any;
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

    this.logger.debug('Metadata structure:', JSON.stringify(metadata, null, 2));

    const products = metadata?.orderDetails?.products as ProductMovement[];
    if (!Array.isArray(products) || products.length === 0) {
      throw new Error(`No valid products found in order ${order.id}`);
    }

    // Preparar userData
    const userData: UserData = {
      id: userId,
      name: 'Super Admin',
      email: 'admin@admin.com',
      phone: '1234567890',
      isSuperAdmin: true,
      roles: [],
    };

    this.logger.log('Processing outgoing operations');

    try {
      // Obtenemos el storageId del branch
      const branchId = metadata?.orderDetails?.branchId;
      if (!branchId) {
        throw new Error(`Missing branchId in order ${order.id}`);
      }

      // Validar stock para todos los productos antes de procesar
      for (const product of products) {
        // Usamos el storageId del producto si está disponible, de lo contrario usamos el branchId
        const storageId = product.storageId || branchId;

        await this.validateStock(order, {
          productId: product.id,
          quantity: product.quantity,
          storageId: storageId,
        });
      }

      // Mapeamos los productos para el outgoing y los agrupamos por storageId
      const productsByStorage: Record<
        string,
        { productId: string; quantity: number }[]
      > = {};

      for (const product of products) {
        // Usamos el storageId del producto si está disponible, de lo contrario usamos el branchId
        const storageId = product.storageId || branchId;

        if (!productsByStorage[storageId]) {
          productsByStorage[storageId] = [];
        }

        productsByStorage[storageId].push({
          productId: product.id,
          quantity: product.quantity,
        });
      }

      // Crear un outgoing para cada almacén
      await Promise.all(
        Object.entries(productsByStorage).map(async ([storageId, products]) => {
          const createOutgoingDto: CreateOutgoingDtoStorage = {
            name: `Órden de venta ${order.code}`,
            storageId: storageId,
            date: new Date(),
            state: true,
            movement: products,
          };

          await this.outgoingService.createOutgoing(
            createOutgoingDto,
            userData,
          );
        }),
      );

      this.logger.log(
        `Successfully processed all ${products.length} products for order ${order.id}`,
      );
    } catch (error) {
      this.logger.error('Error processing outgoing products in order: ', {
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Procesa una orden de prescripción médica
   */
  private async processMedicalPrescriptionOrder(order: Order, userId: string) {
    this.logger.log(`Processing medical prescription outgoing movement`);

    let metadata: any;
    try {
      metadata =
        typeof order.metadata === 'string'
          ? JSON.parse(order.metadata)
          : order.metadata;
    } catch (error) {
      throw new Error(
        `Invalid metadata format for prescription order ${order.id}: ${error.message}`,
      );
    }

    this.logger.debug('Prescription metadata structure:', JSON.stringify(metadata, null, 2));

    const products = metadata?.orderDetails?.products as ProductMovement[];
    if (!Array.isArray(products) || products.length === 0) {
      this.logger.log(`No products found in prescription order ${order.id}, skipping inventory processing`);
      return;
    }

    // Preparar userData
    const userData: UserData = {
      id: userId,
      name: 'Super Admin',
      email: 'admin@admin.com',
      phone: '1234567890',
      isSuperAdmin: true,
      roles: [],
    };

    this.logger.log('Processing prescription outgoing operations');

    try {
      // Obtenemos el storageId del branch
      const branchId = metadata?.orderDetails?.branchId;
      if (!branchId) {
        throw new Error(`Missing branchId in prescription order ${order.id}`);
      }

      // Validar stock para todos los productos antes de procesar
      for (const product of products) {
        // Usamos el storageId del producto si está disponible, de lo contrario usamos el branchId
        const storageId = product.storageId || branchId;

        await this.validateStock(order, {
          productId: product.id,
          quantity: product.quantity,
          storageId: storageId,
        });
      }

      // Mapeamos los productos para el outgoing y los agrupamos por storageId
      const productsByStorage: Record<
        string,
        { productId: string; quantity: number }[]
      > = {};

      for (const product of products) {
        // Usamos el storageId del producto si está disponible, de lo contrario usamos el branchId
        const storageId = product.storageId || branchId;

        if (!productsByStorage[storageId]) {
          productsByStorage[storageId] = [];
        }

        productsByStorage[storageId].push({
          productId: product.id,
          quantity: product.quantity,
        });
      }

      // Crear un outgoing para cada almacén
      await Promise.all(
        Object.entries(productsByStorage).map(async ([storageId, products]) => {
          const createOutgoingDto: CreateOutgoingDtoStorage = {
            name: `Prescripción médica ${order.code}`,
            storageId: storageId,
            date: new Date(),
            state: true,
            movement: products,
          };

          await this.outgoingService.createOutgoing(
            createOutgoingDto,
            userData,
          );
        }),
      );

      this.logger.log(
        `Successfully processed all ${products.length} products for prescription order ${order.id}`,
      );
    } catch (error) {
      this.logger.error('Error processing outgoing products in prescription order: ', {
        error: error.message,
      });
      throw error;
    }
  }

  private async validateStock(
    order: Order,
    product: { productId: string; quantity: number; storageId?: string },
  ) {
    try {
      // Verificar que el producto tenga storageId
      const storageId = product.storageId;
      if (!storageId) {
        throw new Error(
          `Missing storageId for product ${product.productId} in order ${order.id}`,
        );
      }

      this.logger.debug('Validating stock for:', {
        storageId,
        productId: product.productId,
        quantity: product.quantity,
      });

      const stockActual =
        await this.stockRepository.getStockByStorageAndProduct(
          storageId,
          product.productId,
        );

      this.logger.log('stockActual:', stockActual);

      if (!stockActual || stockActual.stock < product.quantity) {
        throw new Error(
          `Insufficient stock for product ${product.productId} in storage ${storageId}. Required: ${product.quantity}, Available: ${stockActual ? stockActual.stock : 0}`,
        );
      }
    } catch (error) {
      this.logger.error('Error validating stock:', {
        orderId: order.id,
        productId: product.productId,
        error: error.message,
      });
      throw error;
    }
  }
}
