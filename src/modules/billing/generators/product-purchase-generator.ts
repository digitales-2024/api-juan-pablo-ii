import { BaseOrderGenerator } from '@pay/pay/generators/base-order.generator';
import { IOrder } from '@pay/pay/interfaces';
import { OrderStatus, OrderType } from '@pay/pay/interfaces/order.types';
import { BadRequestException, Inject } from '@nestjs/common';
import { ProductService } from '@inventory/inventory/product/services/product.service';
import {
  CreateProductPurchaseBillingDto,
  ProductPurchaseItemDto,
} from '../dto/create-product-purchase-billing.dto';
import { ProductPurchaseMetadata } from '../interfaces/metadata.interfaces';
// import { SupplierService } from '@clients/clients/services/supplier.service'; // Asume que existe este servicio

/**
 * Generador para órdenes de compra de productos.
 * Se integra con servicios reales de producto, proveedor e inventario.
 */
export class ProductPurchaseGenerator extends BaseOrderGenerator {
  type = OrderType.PRODUCT_PURCHASE_ORDER;

  constructor(
    @Inject(ProductService)
    private readonly productService: ProductService,
    // @Inject(SupplierService)
    // private readonly supplierService: SupplierService,
  ) {
    super();
  }

  async generate(input: CreateProductPurchaseBillingDto): Promise<IOrder> {
    // Validar productos y proveedor
    await this.validateProducts(input.products);
    // await this.validateSupplier(input.supplierId);

    // Calcular subtotal y obtener detalles de productos
    const { subtotal, productDetails } = await this.calculateProductTotals(
      input.products,
    );
    const tax = subtotal * 0.18; // 18% IGV
    const total = subtotal + tax;

    const metadata: ProductPurchaseMetadata = {
      services: productDetails,
      orderDetails: {
        transactionType: 'PURCHASE',
        storageId: input.storageId,
        branchId: input.branchId,
        supplierId: input.supplierId,
        products: input.products.map((product) => ({
          productId: product.productId,
          quantity: product.quantity,
        })),
      },

      purchaseDetails: {
        purchaseOrder: input.referenceId,
        expectedDeliveryDate: new Date(), // Puedes personalizar esto
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
      code: this.generateCode('PC'), // PC = Purchase
      type: OrderType.PRODUCT_PURCHASE_ORDER,
      status: OrderStatus.PENDING,
      movementTypeId: '', // Este se genera en el use case
      referenceId: input.referenceId || '',
      sourceId: input.supplierId, // Proveedor como fuente
      targetId: input.storageId, // Almacén como destino
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
   * Validación de productos
   */
  private async validateProducts(
    products: ProductPurchaseItemDto[],
  ): Promise<boolean> {
    try {
      if (!products || products.length === 0) {
        throw new BadRequestException('Debe proporcionar al menos un producto');
      }

      for (const product of products) {
        // Verificar que el producto exista y esté activo
        const productInfo = await this.productService.findOne(
          product.productId,
        );

        if (!productInfo) {
          throw new BadRequestException(
            `Producto con ID ${product.productId} no encontrado`,
          );
        }

        // if (productInfo.isActive === false) {
        //   throw new BadRequestException(
        //     `El producto ${productInfo.name} (${product.productId}) no está activo`,
        //   );
        // }

        if (product.quantity <= 0) {
          throw new BadRequestException(
            `La cantidad para el producto ${productInfo.name} debe ser mayor a 0`,
          );
        }

        if (product.unitPrice <= 0) {
          throw new BadRequestException(
            `El precio unitario para el producto ${productInfo.name} debe ser mayor a 0`,
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

  // /**
  //  * Validación del proveedor
  //  */
  // private async validateSupplier(supplierId: string): Promise<void> {
  //   try {
  //     // Asume que existe un método findOne en SupplierService
  //     const supplier = await this.supplierService.findOne(supplierId);

  //     if (!supplier) {
  //       throw new BadRequestException(
  //         `Proveedor con ID ${supplierId} no encontrado`,
  //       );
  //     }

  //     if (supplier.isActive === false) {
  //       throw new BadRequestException(
  //         `El proveedor ${supplier.name} (${supplierId}) no está activo`,
  //       );
  //     }
  //   } catch (error) {
  //     if (error instanceof BadRequestException) {
  //       throw error;
  //     }
  //     throw new BadRequestException(
  //       'Error validando proveedor: ' + error.message,
  //     );
  //   }
  // }

  /**
   * Calcula los totales de los productos
   */
  private async calculateProductTotals(
    products: ProductPurchaseItemDto[],
  ): Promise<{
    subtotal: number;
    productDetails: any[];
  }> {
    let subtotal = 0;
    const productDetails = [];

    for (const product of products) {
      const productInfo = await this.productService.findOne(product.productId);

      if (!productInfo) {
        throw new BadRequestException(
          `No se encontró la información del producto ${product.productId}`,
        );
      }

      const productSubtotal = product.quantity * product.unitPrice;
      subtotal += productSubtotal;

      productDetails.push({
        id: product.productId,
        name: productInfo.name,
        quantity: product.quantity,
        price: product.unitPrice,
        subtotal: productSubtotal,
      });
    }

    return { subtotal, productDetails };
  }

  /**
   * Calcula el total de la compra
   */
  async calculateTotal(
    input: CreateProductPurchaseBillingDto,
  ): Promise<number> {
    // Si viene un total preestablecido, lo usamos
    if (input.metadata?.totalAmount) {
      return input.metadata.totalAmount;
    }

    // Calcular total basado en productos
    return this.calculateProductTotals(input.products).then(
      (result) => result.subtotal,
    );
  }
}
