import { BaseOrderGenerator } from '@pay/pay/generators/base-order.generator';
import { IOrder } from '@pay/pay/interfaces';
import { OrderStatus, OrderType } from '@pay/pay/interfaces/order.types';
import { BadRequestException, Inject } from '@nestjs/common';
import { ProductService } from '@inventory/inventory/product/services/product.service';
import {
  CreateProductSaleBillingDto,
  ProductSaleItemDto,
} from '../dto/create-product-sale-billing.dto';
import { ProductSaleMetadata } from '../interfaces/metadata.interfaces';

/**
 * Generador para órdenes de venta de productos.
 * @remarks
 * Este generador se integra con servicios reales de producto, stock e inventario.
 */
export class ProductSaleGenerator extends BaseOrderGenerator {
  type = OrderType.PRODUCT_SALE_ORDER;

  constructor(
    @Inject(ProductService)
    private readonly productService: ProductService,
  ) {
    super();
  }

  async generate(input: CreateProductSaleBillingDto): Promise<IOrder> {
    await this.validateProducts(input.products);

    // Calcular subtotal y obtener detalles de productos
    const { subtotal, productDetails } = await this.calculateProductTotals(
      input.products,
    );
    const tax = subtotal * 0.18; // 18% IGV
    const total = subtotal + tax;

    const metadata: ProductSaleMetadata = {
      services: productDetails, // Ahora incluye nombre y subtotal por producto
      orderDetails: {
        transactionType: 'SALE',
        storageId: input.storageId,
        branchId: input.branchId,
        products: input.products.map((product) => ({
          productId: product.productId,
          quantity: product.quantity,
        })),
      },
      inventory: {
        location: input.storageLocation || '',
        batch: input.batchNumber,
      },
      transactionDetails: {
        subtotal,
        tax,
        total,
      },
      customFields: input.metadata,
    };

    return {
      ...this.createOrderBase(),
      code: this.generateCode('PS'), // PS = Product Sale
      type: OrderType.PRODUCT_SALE_ORDER,
      status: OrderStatus.PENDING,
      movementTypeId: '', // Este se genera en el use case
      referenceId: input.referenceId || '',
      sourceId: input.storageId, // Almacén de origen
      targetId: '', // No aplica para ventas de productos
      subtotal,
      tax,
      total,
      currency: input.currency || 'PEN',
      date: new Date(),
      notes: input.notes,
      metadata,
    };
  }

  /**
   * Validación básica de productos
   * NOTA: La validación de stock detallada debe hacerse en el use case
   */
  private async validateProducts(
    products: ProductSaleItemDto[],
  ): Promise<boolean> {
    try {
      if (!products || products.length === 0) {
        throw new BadRequestException('Debe proporcionar al menos un producto');
      }

      for (const product of products) {
        if (product.quantity <= 0) {
          throw new BadRequestException(
            `La cantidad para el producto ${product.productId} debe ser mayor a 0`,
          );
        }
      }
      return true;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        'Error validando productos: ' + error.message,
      );
    }
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

    for (const product of products) {
      const price = await this.productService.getProductPriceById(
        product.productId,
      );
      if (!price) {
        throw new BadRequestException(
          `No se pudo obtener el precio del producto ${product.productId}`,
        );
      }

      const productSubtotal = price * product.quantity;
      subtotal += productSubtotal;

      const productInfo = await this.productService.findOne(product.productId);
      productDetails.push({
        id: product.productId,
        name: productInfo.name,
        quantity: product.quantity,
        price,
        subtotal: productSubtotal,
      });
    }

    return { subtotal, productDetails };
  }
}
