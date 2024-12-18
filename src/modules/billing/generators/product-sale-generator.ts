import { BaseOrderGenerator } from '@pay/pay/generators/base-order.generator';
import { IOrder } from '@pay/pay/interfaces';
import { OrderStatus, OrderType } from '@pay/pay/interfaces/order.types';
import { BadRequestException } from '@nestjs/common';

// Interfaces para productos
interface ProductSaleItem {
  productId: string;
  name?: string; // Opcional porque se llena después
  quantity: number;
  price?: number; // Opcional porque se llena después
  subtotal?: number; // Opcional porque se llena después
}

interface ProductData {
  id: string;
  name: string;
  price: number;
  stock: number;
  isActive: boolean;
}

/**
 * Generador para órdenes de venta de productos.
 * @remarks
 * Para implementar esto en producción, necesitarás:
 * 1. Un servicio de productos que exponga:
 *    - findProductById(id: string): Promise<ProductData>
 *    - checkStock(productId: string, quantity: number): Promise<boolean>
 *    - reserveStock(productId: string, quantity: number): Promise<boolean>
 *    - getCurrentPrice(productId: string): Promise<number>
 *    - validateProducts(products: ProductSaleItem[]): Promise<boolean>
 */
export class ProductSaleGenerator extends BaseOrderGenerator {
  type = OrderType.PRODUCT_SALE_ORDER;

  async generate(input: ProductSaleInput): Promise<IOrder> {
    // Validar productos y stock
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
      price: prod.price,
      subtotal: prod.subtotal,
    }));

    // Combinar metadata existente con datos de productos
    const combinedMetadata = {
      ...input.metadata,
      services: serviceData,
      products: productsWithDetails,
    };

    return {
      ...this.createOrderBase(),
      code: this.generateCode('PS'),
      type: OrderType.PRODUCT_SALE_ORDER,
      status: OrderStatus.PENDING,
      movementTypeId: input.movementTypeId,
      referenceId: '', // Venta directa, no tiene referencia
      sourceId: '', // No aplica para venta de productos
      targetId: '', // No aplica para venta de productos
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
   * 3. Validar que hay suficiente stock
   * 4. Validar los precios
   * 5. Reservar el stock temporalmente
   */
  private async validateProducts(
    products: ProductSaleItem[],
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
        if (productData.stock < product.quantity) {
          throw new BadRequestException(
            `Stock insuficiente para el producto ${productData.name} (${product.productId}). Stock disponible: ${productData.stock}, Cantidad solicitada: ${product.quantity}`,
          );
        }
        if (product.quantity <= 0) {
          throw new BadRequestException(
            `La cantidad para el producto ${productData.name} debe ser mayor a 0`,
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
      'f47ac10b-58cc-4372-a567-0e02b2c3d479': {
        id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        name: 'Amoxicilina 500mg',
        price: 150,
        stock: 40,
        isActive: true,
      },
    };
  }

  /**
   * Simula un servicio de productos
   * @remarks
   * En producción, esto debería ser reemplazado por un servicio real que:
   * - Valide que el producto existe
   * - Valide que el producto está activo
   * - Valide y reserve el stock
   * - Obtenga el precio real y actualizado del producto
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
    products: ProductSaleItem[],
  ): Promise<ProductSaleItem[]> {
    const enriched = [];
    for (const product of products) {
      const productData = await this.mockProductService(product.productId);
      enriched.push({
        ...product,
        name: productData.name,
        price: productData.price,
        subtotal: product.quantity * productData.price,
      });
    }
    return enriched;
  }

  async calculateTotal(input: ProductSaleInput): Promise<number> {
    // Si viene un total preestablecido, lo usamos
    if (input.total) return input.total;

    // Calcular total basado en productos
    let total = 0;
    for (const product of input.products) {
      const productData = await this.mockProductService(product.productId);
      total += productData.price * product.quantity;
    }
    return total;
  }
}

export interface ProductSaleInput {
  products: ProductSaleItem[];
  movementTypeId: string;
  total?: number;
  currency?: string;
  date?: Date;
  dueDate?: Date;
  notes?: string;
  metadata?: Record<string, any>;
}
