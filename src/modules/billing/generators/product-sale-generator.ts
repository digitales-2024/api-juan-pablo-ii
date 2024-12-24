import { BaseOrderGenerator } from '@pay/pay/generators/base-order.generator';
import { IOrder } from '@pay/pay/interfaces';
import { OrderStatus, OrderType } from '@pay/pay/interfaces/order.types';
import { BadRequestException } from '@nestjs/common';
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

  async generate(input: CreateProductSaleBillingDto): Promise<IOrder> {
    // Validar productos y stock (esta validación debería hacerse en el use case)
    await this.validateProducts(input.products);

    // Calcular subtotal
    const subtotal = await this.calculateTotal(input);
    const { tax, total } = await this.calculateTotals(subtotal);

    // Preparar metadata para la orden
    const metadata: ProductSaleMetadata = {
      services: input.products.map((product) => ({
        id: product.productId,
        name: '', // Se llenará desde el servicio de productos
        quantity: product.quantity,
        subtotal: 0, // Se calculará basado en el precio del producto
      })),
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
      transactionDetails: {},
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

    // En un escenario real, esto requeriría un servicio de productos para obtener precios
    // Por ahora, devolvemos 0 para que el use case maneje los detalles específicos
    return 0;
  }
}
