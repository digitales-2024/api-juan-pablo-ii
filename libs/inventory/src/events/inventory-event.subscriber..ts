import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { OrderType } from '@pay/pay/interfaces/order.types';
import { TypeMovementRepository } from '../type-movement/repositories/type-movement.repository';
import { MovementRepository } from '../movement/repositories/movement.repository';
import { Order } from '@pay/pay/entities/order.entity';
import { CompensationService } from '../compensation/compensation.service';
import { StockService } from '../stock/services/stock.service';
import { OrderEvents } from '@pay/pay/events/order.events';

@Injectable()
export class InventoryEventSubscriber {
  private readonly logger = new Logger(InventoryEventSubscriber.name);

  constructor(
    private readonly movementRepository: MovementRepository,
    private readonly typeMovementRepository: TypeMovementRepository,
    private readonly stockService: StockService,
    private readonly compensationService: CompensationService,
  ) {}

  @OnEvent(OrderEvents.ORDER_COMPLETED)
  async handleOrderCompleted(payload: { order: Order }) {
    try {
      const { order } = payload;

      if (!this.shouldProcessInventory(order)) {
        return;
      }

      await this.processInventoryMovements(order);
    } catch (error) {
      this.logger.error(
        `Error processing inventory movements for order ${payload.order.id}:`,
        error.stack,
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

  private async processInventoryMovements(order: Order) {
    if (!order.movementTypeId) {
      throw new Error(`Order ${order.id} has no movement type ID`);
    }

    await this.typeMovementRepository.update(order.movementTypeId, {
      state: true,
    });

    const products = order.metadata?.products || [];
    const isIncoming = order.type === OrderType.PRODUCT_PURCHASE_ORDER;

    for (const product of products) {
      await this.createMovement(order, product, isIncoming);
      await this.validateStock(order, product);
    }
  }

  private async createMovement(
    order: Order,
    product: { productId: string; quantity: number },
    isIncoming: boolean,
  ) {
    await this.movementRepository.create({
      movementTypeId: order.movementTypeId,
      productoId: product.productId,
      quantity: isIncoming ? product.quantity : -product.quantity,
      date: new Date(),
      state: true,
    });
  }

  private async validateStock(
    order: Order,
    product: { productId: string; quantity: number },
  ) {
    const stock = await this.stockService.getStockByStorageProduct(
      order.sourceId,
      product.productId,
    );

    if (stock.totalStock < 0) {
      throw new Error(
        `Invalid stock movement: Negative stock for product ${product.productId}`,
      );
    }
  }
}
