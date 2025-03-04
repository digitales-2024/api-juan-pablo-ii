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
import { Patient } from '@pacient/pacient/pacient/entities/pacient.entity';

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
    // await this.validateProducts(input.products);

    const metadata: ProductSaleMetadata = {
      patientDetails: {
        fullName: '', // Se llenará más tarde
        dni: '',
        address: '',
        phone: '',
      },
      orderDetails: {
        transactionType: 'SALE',
        // storageId: input.storageId,
        branchId: input.branchId,
        products: [],
        transactionDetails: {
          subtotal: 0, // Se llenará más tarde
          tax: 1, // Se llenará más tarde
          total: 0, // Se llenará más tarde
        },
      },
    };

    return {
      ...this.createOrderBase(),
      code: this.generateCode('PS'), // PS = Product Sale
      type: OrderType.PRODUCT_SALE_ORDER,
      status: OrderStatus.PENDING,
      movementTypeId: '', // Este se genera en el use case
      referenceId: input.referenceId || '',
      sourceId: '', // Almacén de origen
      targetId: '', // No aplica para ventas de productos
      subtotal: 0,
      tax: 0,
      total: 0,
      currency: input.currency || 'PEN',
      date: new Date(),
      notes: input.notes,
      metadata
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

  async calculateTotal() {
    return 0

  }


  public createEmptyMetadata(createDto: CreateProductSaleBillingDto, patient: Patient): ProductSaleMetadata {
    return {
      patientDetails: {
        fullName: '', // Se llenará más tarde
        dni: '',
        address: '',
        phone: '',
      },
      orderDetails: {
        transactionType: 'SALE',
        // storageId: createDto.storageId,
        branchId: createDto.branchId,
        products: [],
        transactionDetails: {
          subtotal: 0, // Se llenará más tarde
          tax: 2, // Se llenará más tarde
          total: 0, // Se llenará más tarde
        },
      },
    };
  }
}
