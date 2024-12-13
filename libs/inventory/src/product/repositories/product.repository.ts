import { Injectable } from '@nestjs/common';
import { BaseRepository, PrismaService } from '@prisma/prisma';
import { Product } from '../entities/product.entity';

@Injectable()
export class ProductRepository extends BaseRepository<Product> {
  constructor(prisma: PrismaService) {
    super(prisma, 'producto'); // Tabla del esquema de prisma
  }

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
}
