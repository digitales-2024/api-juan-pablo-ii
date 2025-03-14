// import { Injectable, BadRequestException } from '@nestjs/common';
// import { AuditService } from '@login/login/admin/audit/audit.service';
// import { UserData } from '@login/login/interfaces';
// import { AuditActionType } from '@prisma/client';
// import { OrderService } from '@pay/pay/services/order.service';
// import { OrderType, OrderStatus } from '@pay/pay/interfaces/order.types';
// import { CreateProductPurchaseBillingDto } from '../dto/create-product-purchase-billing.dto';
// import { Order } from '@pay/pay/entities/order.entity';
// import { OrderRepository } from '@pay/pay/repositories/order.repository';
// import { PaymentService } from '@pay/pay/services/payment.service';
// import {
//   PaymentMethod,
//   PaymentStatus,
//   PaymentType,
// } from '@pay/pay/interfaces/payment.types';
// import { TypeMovementService } from '@inventory/inventory/type-movement/services/type-movement.service';
// import { ProductPurchaseMetadata } from '../interfaces/metadata.interfaces';
// import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';

// @Injectable()
// export class CreateProductPurchaseOrderUseCase {
//   constructor(
//     private readonly orderService: OrderService,
//     private readonly orderRepository: OrderRepository,
//     private readonly auditService: AuditService,
//     private readonly paymentService: PaymentService,
//     private readonly typeMovementService: TypeMovementService,
//   ) {}

//   async execute(
//     createDto: CreateProductPurchaseBillingDto,
//     user: UserData,
//   ): Promise<BaseApiResponse<Order>> {
//     return await this.orderRepository.transaction(async () => {
//       // Validate product details
//       await this.validateProducts(createDto);

//       // Calculate subtotal and metadata
//       const { subtotal, productDetails } =
//         this.calculateProductTotals(createDto);
//       const tax = subtotal * 0.18; // 18% IGV
//       const total = subtotal + tax;

//       // Prepare metadata
//       const metadata: ProductPurchaseMetadata = {
//         services: productDetails,
//         orderDetails: {
//           transactionType: 'PURCHASE',
//           storageId: createDto.storageId,
//           branchId: createDto.branchId,
//           supplierId: createDto.supplierId,
//           products: createDto.products.map((product) => ({
//             productId: product.productId,
//             quantity: product.quantity,
//           })),
//         },
//         purchaseDetails: {
//           purchaseOrder: createDto.referenceId,
//         },
//         transactionDetails: {
//           subtotal,
//           tax,
//           total,
//         },
//         customFields: createDto.metadata,
//       };

//       // Create movement type for purchase
//       const movementType = await this.typeMovementService.create(
//         {
//           name: OrderType.PRODUCT_PURCHASE_ORDER,
//           description: `Purchase movement - ${new Date().toISOString()}`,
//           state: false,
//           isIncoming: true,
//           tipoExterno: 'PURCHASE',
//         },
//         user,
//       );

//       // Create the order
//       const order = await this.orderService.createOrder(
//         OrderType.PRODUCT_PURCHASE_ORDER,
//         {
//           ...createDto,
//           type: OrderType.PRODUCT_PURCHASE_ORDER,
//           status: OrderStatus.PENDING,
//           metadata,
//           sourceId: createDto.supplierId, // Supplier as source
//           targetId: createDto.storageId, // Storage as target
//           currency: createDto.currency || 'PEN',
//           subtotal,
//           tax,
//           total,
//           referenceId: createDto.referenceId || '',
//         },
//       );

//       // Update the movement type with the order ID
//       await this.typeMovementService.update(
//         movementType.data.id,
//         {
//           orderId: order.id,
//           description: `Purchase movement for order ${order.code}`,
//         },
//         user,
//       );

//       // Update the order with movementTypeId
//       await this.orderRepository.update(order.id, {
//         movementTypeId: movementType.data.id,
//       });

//       // Create pending payment
//       await this.paymentService.create(
//         {
//           orderId: order.id,
//           amount: total,
//           status: PaymentStatus.PENDING,
//           type: PaymentType.REGULAR,
//           description: `Pago pendiente para la compra de producto - ${order.code}`,
//           date: new Date(),
//           paymentMethod: createDto.paymentMethod ?? PaymentMethod.CASH,
//         },
//         user,
//       );

//       // Register audit
//       await this.auditService.create({
//         entityId: order.id,
//         entityType: 'order',
//         action: AuditActionType.CREATE,
//         performedById: user.id,
//         createdAt: new Date(),
//       });

//       return {
//         success: true,
//         message: 'Product purchase order created successfully',
//         data: order,
//       };
//     });
//   }

//   private validateProducts(createDto: CreateProductPurchaseBillingDto): void {
//     if (!createDto.products || createDto.products.length === 0) {
//       throw new BadRequestException('Must provide at least one product');
//     }

//     createDto.products.forEach((product) => {
//       if (product.quantity <= 0) {
//         throw new BadRequestException(
//           `Quantity for product ${product.productId} must be greater than 0`,
//         );
//       }

//       if (product.unitPrice < 0) {
//         throw new BadRequestException(
//           `Unit price for product ${product.productId} cannot be negative`,
//         );
//       }
//     });
//   }

//   private calculateProductTotals(createDto: CreateProductPurchaseBillingDto): {
//     subtotal: number;
//     productDetails: any[];
//   } {
//     let subtotal = 0;
//     const productDetails = createDto.products.map((product) => {
//       const productSubtotal = product.quantity * product.unitPrice;
//       subtotal += productSubtotal;

//       return {
//         id: product.productId,
//         quantity: product.quantity,
//         price: product.unitPrice,
//         subtotal: productSubtotal,
//       };
//     });

//     return { subtotal, productDetails };
//   }
// }
