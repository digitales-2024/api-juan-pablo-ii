import { Injectable } from '@nestjs/common';
import { BaseRepository, PrismaService } from '@prisma/prisma';
import { ActiveProduct, Product } from '../entities/product.entity';

@Injectable()
export class ProductRepository extends BaseRepository<Product> {
  constructor(prisma: PrismaService) {
    super(prisma, 'producto'); // Tabla del esquema de prisma
  }

  //funcion que no se esta usando por ahora
  /**
   * Verifica si existe un registro en una tabla específica por un valor y campo
   * @param field - Campo por el cual buscar (por ejemplo, 'name', 'id', etc.)
   * @param value - Valor a buscar en el campo especificado
   * @param table - Nombre de la tabla donde buscar (por ejemplo, 'Producto', 'Categoria', etc.)
   * @returns true si existe el registro, false si no existe
   */
  async ValidateDataTable(
    field: string,
    value: any,
    table: string,
  ): Promise<boolean> {
    const result = await this.findOneDataTable(field, value, table);
    return result.length > 0;
  }
  /**
   * Obtiene el precio de un producto por su ID
   * @param productId - ID del producto
   * @returns El precio del producto
   */
  async getProductPriceById(productId: string): Promise<number | null> {
    const product = await this.prisma.producto.findUnique({
      where: { id: productId },
      select: { precio: true },
    });
    return product ? product.precio : null;
  }

  async findAllActiveProducts(): Promise<ActiveProduct[]> {
    return await this.prisma.producto.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        precio: true,
        categoriaId: true,
        tipoProductoId: true,
        categoria: {
          select: {
            name: true,
            isActive: true,
          },
        },
        tipoProducto: {
          select: {
            name: true,
            isActive: true,
          },
        },
      },
    });
  }
}
