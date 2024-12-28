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
import { StockRepository } from '../stock/repositories/stock.repository';
import { StockService } from '../stock/services/stock.service';
import { UserData } from '@login/login/interfaces';
import { CreateIncomingDtoStorage } from '../incoming/dto/create-incomingStorage.dto';
import { IncomingService } from '../incoming/services/incoming.service';

@Injectable()
export class InventoryEventSubscriber {
  private readonly logger = new Logger(InventoryEventSubscriber.name);

  constructor(
    private readonly movementRepository: MovementRepository,
    private readonly typeMovementRepository: TypeMovementRepository,
    private readonly stockRepository: StockRepository,
    private readonly compensationService: CompensationService,
    private readonly incomingRepository: IncomingRepository,
    private readonly incomingService: IncomingService,
    private readonly outgoingRepository: OutgoingRepository,
    private readonly stockService: StockService,
  ) {}

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
      OrderType.PRODUCT_PURCHASE_ORDER,
    ].includes(order.type as OrderType);
  }

  private async processInventoryMovements(order: Order, userId: string) {
    if (!order.movementTypeId) {
      throw new Error(`Order ${order.id} has no movement type ID`);
    }

    const isIncoming = order.type === OrderType.PRODUCT_PURCHASE_ORDER;
    this.logger.log(
      `Processing ${isIncoming ? 'incoming' : 'outgoing'} movement`,
    );

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

    const products = metadata?.orderDetails?.products;
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

    // Si es incoming, usar createIncoming además del flujo normal
    if (isIncoming) {
      this.logger.log(
        'Processing additional incoming flow with createIncoming',
      );
      const createIncomingDto: CreateIncomingDtoStorage = {
        name: `Purchase Order ${order.code}`,
        storageId: storageId,
        date: new Date(),
        state: true,
        movement: products.map((product) => ({
          productId: product.productId,
          quantity: product.quantity,
        })),
      };

      await this.incomingService.createIncoming(createIncomingDto, userData);
    }

    await Promise.all(
      products.map(async (product) => {
        try {
          this.logger.debug('Processing product:', {
            productId: product.productId,
            quantity: product.quantity,
            orderId: order.id,
            storageId,
          });

          await this.createMovement(order, product, isIncoming, record.id);

          if (!isIncoming) {
            await this.stockService.updateStockOutgoing(
              storageId,
              product.productId,
              product.quantity,
              userData,
            );

            this.logger.log(
              `Stock updated for product ${product.productId} - Quantity: ${product.quantity}`,
            );
          }

          if (order.type === OrderType.PRODUCT_SALE_ORDER) {
            await this.validateStock(order, product);
          }
        } catch (error) {
          this.logger.error('Error processing product:', {
            productId: product.productId,
            error: error.message,
          });
          throw error;
        }
      }),
    );

    this.logger.log(
      `Successfully processed all ${products.length} products for order ${order.id}`,
    );
  }

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

  private async validateStock(
    order: Order,
    product: { productId: string; quantity: number },
  ) {
    let metadata: ProductSaleMetadata | ProductPurchaseMetadata;
    try {
      metadata =
        typeof order.metadata === 'string'
          ? JSON.parse(order.metadata)
          : order.metadata;
      const storageId = metadata?.orderDetails?.storageId;
      if (!storageId) {
        throw new Error(`Missing storageId in metadata for order ${order.id}`);
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
      if (stockActual.stock < 0) {
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
