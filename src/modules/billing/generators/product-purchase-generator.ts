import { BadRequestException } from '@nestjs/common';
import { BaseOrderGenerator } from '@pay/pay/generators/base-order.generator';
import { IOrder } from '@pay/pay/interfaces';
import { OrderStatus, OrderType } from '@pay/pay/interfaces/order.types';

// Interfaces para simular respuestas de otros servicios
interface ProductData {
  id: string;
  name: string;
  price: number;
  stock: number;
  isActive: boolean;
}

interface ProductPurchaseItem {
  productId: string;
  name?: string;
  quantity: number;
  unitPrice: number;
  subtotal?: number;
}

/**
 * Generador para órdenes de compra de productos.
 * @remarks
 * Para implementar esto en producción, necesitarás:
 * 1. Un servicio de productos que exponga:
 *    - findProductById(id: string): Promise<ProductData>
 *    - validateProducts(products: ProductPurchaseItem[]): Promise<boolean>
 * 2. Un servicio de proveedores que exponga:
 *    - findSupplierById(id: string): Promise<SupplierData>
 *    - validateSupplier(supplierId: string): Promise<boolean>
 */
export class ProductPurchaseGenerator extends BaseOrderGenerator {
  type = OrderType.PRODUCT_PURCHASE_ORDER;

  async generate(input: ProductPurchaseInput): Promise<IOrder> {
    // Validar productos
    await this.validateProducts(input.products);

    const subtotal = await this.calculateTotal(input);
    const { tax, total } = await this.calculateTotals(subtotal);

    // Obtener detalles completos de productos
    const productsWithDetails = await this.enrichProductsData(input.products);

    // Crear el objeto de servicios (productos)
    const serviceData = productsWithDetails.map((prod) => ({
      id: prod.productId,
      name: prod.name,
      quantity: prod.quantity,
      unitPrice: prod.unitPrice,
      subtotal: prod.subtotal,
    }));

    // Combinar metadata existente con datos de productos
    const combinedMetadata = {
      ...input.metadata,
      services: serviceData,
      products: productsWithDetails,
      supplierId: input.supplierId,
    };

    return {
      ...this.createOrderBase(),
      code: this.generateCode('PC'), // PC = Purchase
      type: OrderType.PRODUCT_PURCHASE_ORDER,
      status: OrderStatus.PENDING,
      movementTypeId: input.movementTypeId,
      referenceId: '', // No aplica para compras directas
      sourceId: input.supplierId,
      targetId: '', // No aplica para compras
      subtotal,
      tax,
      total,
      currency: input.currency || 'PEN',
      date: input.date || new Date(),
      dueDate: input.dueDate,
      notes: input.notes,
      metadata: combinedMetadata,
    };
  }

  /**
   * Simula la validación de productos y stock
   * @remarks
   * En producción, deberías:
   * 1. Validar que cada producto existe
   * 2. Validar que cada producto está activo
   * 3. Validar los precios
   */
  private async validateProducts(
    products: ProductPurchaseItem[],
  ): Promise<boolean> {
    try {
      if (!products || products.length === 0) {
        throw new BadRequestException('Debe proporcionar al menos un producto');
      }

      for (const product of products) {
        const productData = await this.mockProductService(product.productId);
        if (!productData) {
          throw new BadRequestException(
            `Producto con ID ${product.productId} no encontrado`,
          );
        }
        if (!productData.isActive) {
          throw new BadRequestException(
            `El producto ${productData.name} (${product.productId}) no está activo`,
          );
        }
        if (product.quantity <= 0) {
          throw new BadRequestException(
            `La cantidad para el producto ${productData.name} debe ser mayor a 0`,
          );
        }
        if (product.unitPrice <= 0) {
          throw new BadRequestException(
            `El precio unitario para el producto ${productData.name} debe ser mayor a 0`,
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
   * Obtiene el mock de productos
   */
  private getMockProducts(): Record<string, ProductData> {
    return {
      'ece57703-3246-4c2d-8f82-825cd239237a': {
        id: 'ece57703-3246-4c2d-8f82-825cd239237a',
        name: 'Paracetamol 500mg',
        price: 100,
        stock: 50,
        isActive: true,
      },
      'de6639ac-7373-4612-8196-f4eb8374b7a6': {
        id: 'de6639ac-7373-4612-8196-f4eb8374b7a6',
        name: 'Ibuprofeno 400mg',
        price: 200,
        stock: 30,
        isActive: true,
      },
    };
  }

  /**
   * Simula un servicio de productos
   */
  private async mockProductService(
    productId: string,
  ): Promise<ProductData | null> {
    const mockProducts = this.getMockProducts();
    return mockProducts[productId] || null;
  }

  /**
   * Enriquece los datos de productos con información adicional
   */
  private async enrichProductsData(
    products: ProductPurchaseItem[],
  ): Promise<ProductPurchaseItem[]> {
    const enriched = [];
    for (const product of products) {
      const productData = await this.mockProductService(product.productId);
      enriched.push({
        ...product,
        name: productData.name,
        subtotal: product.quantity * product.unitPrice,
      });
    }
    return enriched;
  }

  async calculateTotal(input: ProductPurchaseInput): Promise<number> {
    // Si viene un total preestablecido, lo usamos
    if (input.total) return input.total;

    // Calcular total basado en productos
    return input.products.reduce(
      (total, product) => total + product.quantity * product.unitPrice,
      0,
    );
  }
}

export interface ProductPurchaseInput {
  products: ProductPurchaseItem[];
  movementTypeId: string;
  supplierId: string;
  total?: number;
  currency?: string;
  date?: Date;
  dueDate?: Date;
  notes?: string;
  metadata?: Record<string, any>;
}
