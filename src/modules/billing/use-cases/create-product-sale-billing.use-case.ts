import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { UserData } from '@login/login/interfaces';
import { AuditActionType } from '@prisma/client';
import { OrderService } from '@pay/pay/services/order.service';
import { OrderType, OrderStatus } from '@pay/pay/interfaces/order.types';
import {
  CreateProductSaleBillingDto,
  ProductSaleItemDto,
} from '../dto/create-product-sale-billing.dto';
import { Order } from '@pay/pay/entities/order.entity';
import { OrderRepository } from '@pay/pay/repositories/order.repository';
import { PaymentService } from '@pay/pay/services/payment.service';
import {
  PaymentMethod,
  PaymentStatus,
  PaymentType,
} from '@pay/pay/interfaces/payment.types';
import { TypeMovementService } from '@inventory/inventory/type-movement/services/type-movement.service';
import { StockRepository } from '@inventory/inventory/stock/repositories/stock.repository';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';
import { PacientService } from '@pacient/pacient/pacient/services/pacient.service';
import { ProductSaleGenerator } from '../generators/product-sale-generator';
import { ProductService } from '@inventory/inventory/product/services/product.service';
import { StockService } from '@inventory/inventory/stock/services/stock.service';

@Injectable()
export class CreateProductSaleOrderUseCase {
  private readonly logger = new Logger(CreateProductSaleOrderUseCase.name); // Inicializa el logger

  constructor(
    private readonly orderService: OrderService,
    private readonly orderRepository: OrderRepository,
    private readonly auditService: AuditService,
    private readonly paymentService: PaymentService,
    private readonly productService: ProductService,
    private readonly stockService: StockService,
    private readonly patientService: PacientService,
    private readonly productSaleGenerator: ProductSaleGenerator,
  ) {}

  async execute(
    createDto: CreateProductSaleBillingDto,
    user: UserData,
  ): Promise<BaseApiResponse<Order | { unavailableProducts: any[] }>> {
    const patient = await this.patientService.findOne(createDto.patientId);

    // Log de los datos del paciente
    this.logger.log(`Datos del paciente: ${JSON.stringify(patient)}`);

    const unavailableProducts = []; // Array para almacenar productos sin stock

    // Validar disponibilidad de stock para todos los productos
    for (const product of createDto.products) {
      const stockInStorage = await this.stockService.getStockByStorageProduct(
        product.storageId,
        product.productId,
      );
      const productStock = stockInStorage[0]?.stock.find(
        (item) => item.idProduct === product.productId,
      );

      if (!productStock || productStock.stock < product.quantity) {
        const productName = productStock
          ? productStock.name
          : product.productId;
        const storageName = stockInStorage[0]?.name || product.storageId;

        unavailableProducts.push({
          productId: product.productId,
          productName: productName,
          storageName: storageName,
          requestedQuantity: product.quantity,
          availableQuantity: productStock ? productStock.stock : 0,
        });
      } else {
        this.logger.log(
          `Disponibilidad de stock para el producto ${product.productId} en el almacén ${product.storageId}: Suficiente`,
        );
      }
    }

    if (unavailableProducts.length > 0) {
      return {
        success: false,
        message: 'Algunos productos no tienen suficiente stock',
        data: {
          unavailableProducts,
        },
      };
    }

    // Crear metadata vacía usando el generador
    const metadata = this.productSaleGenerator.createEmptyMetadata(
      createDto,
      patient,
    );

    // Llenar los detalles del paciente
    metadata.patientDetails.fullName = `${patient.name} ${patient.lastName}`;
    metadata.patientDetails.dni = patient.dni;
    metadata.patientDetails.address = patient.address;
    metadata.patientDetails.phone = patient.phone;

    // Log de los detalles del paciente
    this.logger.log(
      `Detalles del paciente en metadata: ${JSON.stringify(metadata.patientDetails)}`,
    );

    // Calcular el subtotal, impuestos y detalles de los productos
    const { subtotal, tax, total, productDetails } =
      await this.calculateProductTotals(createDto.products);

    // Log del subtotal y detalles de los productos
    this.logger.log(`Subtotal calculado: ${subtotal}`);
    this.logger.log(
      `Detalles de los productos: ${JSON.stringify(productDetails)}`,
    );

    // Actualiza el metadata con los valores calculados
    metadata.orderDetails.transactionDetails = {
      subtotal,
      tax,
      total,
    };

    // Añadir los detalles de los productos a metadata
    metadata.orderDetails.products = productDetails;

    // Log de la metadata completa
    this.logger.log(`Metadata: ${JSON.stringify(metadata)}`);

    const order = await this.orderService.createOrder(
      OrderType.PRODUCT_SALE_ORDER,
      {
        ...createDto,
        metadata, // Asegúrate de que la metadata se guarde como un string
        type: OrderType.PRODUCT_SALE_ORDER,
        status: OrderStatus.PENDING,
        currency: createDto.currency || 'PEN',
        referenceId: createDto.referenceId || '',
        subtotal, // Asegúrate de que el subtotal se guarde en la orden
        tax,
        total,
      },
    );

    this.logger.log(`Order: ${JSON.stringify(metadata)}`);

    // Update the order with movementTypeId
    await this.orderRepository.update(order.id, {
      movementTypeId: order.movementTypeId,
    });
    // Update the order with calculated totals and metadata
    const updatedOrder = await this.orderRepository.update(order.id, {
      subtotal: subtotal,
      tax: tax,
      total: total,
      metadata: metadata, // Guarda la metadata actualizada
    });

    // Create pending payment with the calculated total
    await this.paymentService.create(
      {
        orderId: order.id,
        amount: total, // This total already includes tax
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
      data: updatedOrder,
    };
  }

  /**
   * Calcula el total basado en los productos
   */
  async calculateTotal(input: CreateProductSaleBillingDto): Promise<number> {
    // Si viene un total preestablecido, lo usamos
    if (input.metadata?.totalAmount) {
      return input.metadata.totalAmount;
    }

    return 0;
  }

  private async calculateProductTotals(products: ProductSaleItemDto[]) {
    let subtotal = 0;
    const productDetails = [];
    const taxRate = 0.18; // 18% impuesto

    for (const product of products) {
      const priceWithTax = await this.productService.getProductPriceById(
        product.productId,
      );
      if (!priceWithTax) {
        throw new BadRequestException(
          `No se pudo obtener el precio del producto ${product.productId}`,
        );
      }

      // Calcular el subtotal sin impuesto (precio base)
      const productSubtotal = (priceWithTax / (1 + taxRate)) * product.quantity;
      subtotal += productSubtotal;

      const productInfo = await this.productService.findById(product.productId);
      productDetails.push({
        id: product.productId,
        name: productInfo.name,
        quantity: product.quantity,
        price: priceWithTax, // Mostrar el precio con impuesto al usuario
        subtotal: productSubtotal, // Subtotal sin impuesto para cálculos internos
      });
    }

    const tax = subtotal * taxRate;
    const total = subtotal + tax; // El total debe ser igual al precio original con impuesto

    return {
      subtotal: parseFloat(subtotal.toFixed(2)),
      tax: parseFloat(tax.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
      productDetails,
    };
  }
}
