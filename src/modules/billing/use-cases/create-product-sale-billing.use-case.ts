import { Injectable, BadRequestException } from '@nestjs/common';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { UserData } from '@login/login/interfaces';
import { AuditActionType } from '@prisma/client';
import { OrderService } from '@pay/pay/services/order.service';
import { OrderType, OrderStatus } from '@pay/pay/interfaces/order.types';
import { CreateProductSaleBillingDto } from '../dto/create-product-sale-billing.dto';
import { Order } from '@pay/pay/entities/order.entity';
import { OrderRepository } from '@pay/pay/repositories/order.repository';
import { PaymentService } from '@pay/pay/services/payment.service';
import {
  PaymentMethod,
  PaymentStatus,
  PaymentType,
} from '@pay/pay/interfaces/payment.types';
import { TypeMovementService } from '@inventory/inventory/type-movement/services/type-movement.service';
import { ProductSaleMetadata } from '../interfaces/metadata.interfaces';
import { StockRepository } from '@inventory/inventory/stock/repositories/stock.repository';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';

@Injectable()
export class CreateProductSaleOrderUseCase {
  constructor(
    private readonly orderService: OrderService,
    private readonly orderRepository: OrderRepository,
    private readonly auditService: AuditService,
    private readonly paymentService: PaymentService,
    private readonly typeMovementService: TypeMovementService,
    private readonly stockRepository: StockRepository,
  ) {}

  async execute(
    createDto: CreateProductSaleBillingDto,
    user: UserData,
  ): Promise<BaseApiResponse<Order>> {
    return await this.orderRepository.transaction(async () => {
      // Validate stock availability
      await this.validateStock(createDto);

      // Create movement type for sale
      const movementType = await this.typeMovementService.create(
        {
          name: OrderType.PRODUCT_SALE_ORDER,
          description: `Sale movement - ${new Date().toISOString()}`,
          state: false,
          isIncoming: false,
          tipoExterno: 'SALE',
        },
        user,
      );

      // Prepare metadata
      const metadata: ProductSaleMetadata = {
        services: createDto.products.map((product) => ({
          id: product.productId,
          name: '', // Will be populated from product service
          quantity: product.quantity,
          subtotal: 0, // Will be calculated based on product price
        })),
        orderDetails: {
          transactionType: 'SALE',
          storageId: createDto.storageId,
          branchId: createDto.branchId,
          products: createDto.products.map((product) => ({
            productId: product.productId,
            quantity: product.quantity,
          })),
        },
        inventory: {
          location: createDto.storageLocation || '',
          batch: createDto.batchNumber,
        },
      };

      // Create the order without movementTypeId
      const order = await this.orderService.createOrder(
        OrderType.PRODUCT_SALE_ORDER,
        {
          ...createDto,
          type: OrderType.PRODUCT_SALE_ORDER,
          status: OrderStatus.PENDING,
          metadata,
          sourceId: createDto.storageId,
          currency: createDto.currency || 'PEN',
          referenceId: createDto.referenceId || '',
        },
      );

      // Update the movement type with the order ID
      await this.typeMovementService.update(
        movementType.data.id,
        {
          orderId: order.id,
          description: `Sale movement for order ${order.code}`,
        },
        user,
      );

      // Update the order with movementTypeId
      await this.orderRepository.update(order.id, {
        movementTypeId: movementType.data.id,
      });

      // Create pending payment with the calculated total
      await this.paymentService.create(
        {
          orderId: order.id,
          amount: order.total, // This total already includes tax
          status: PaymentStatus.PENDING,
          type: PaymentType.REGULAR,
          description: `Payment pending for sale - ${order.code}`,
          date: new Date(),
          paymentMethod: createDto.paymentMethod ?? PaymentMethod.CASH,
        },
        user,
      );

      // Register audit
      await this.auditService.create({
        entityId: order.id,
        entityType: 'order',
        action: AuditActionType.CREATE,
        performedById: user.id,
        createdAt: new Date(),
      });

      return {
        success: true,
        message: 'Product sale order created successfully',
        data: order,
      };
    });
  }

  async validateStock(dto: CreateProductSaleBillingDto) {
    for (const product of dto.products) {
      const stock = await this.stockRepository.getStockByStorageAndProduct(
        dto.storageId,
        product.productId,
      );

      if (!stock.stock || stock.stock < product.quantity) {
        throw new BadRequestException(
          `Insufficient stock for product ${product.productId}`,
        );
      }
    }
  }
}
