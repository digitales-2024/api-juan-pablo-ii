import { Injectable } from '@nestjs/common';
import { BaseRepository, PrismaService } from '@prisma/prisma';
import { Product } from '../entities/product.entity';

@Injectable()
export class ProductRepository extends BaseRepository<Product> {
  constructor(prisma: PrismaService) {
    super(prisma, 'producto'); // Tabla del esquema de prisma
  }

  /**
   * Verifica si existe un producto con el nombre especificado
   * @param name - Nombre a buscar
   * @returns true si existe el producto, false si no existe
   */
  async findExistName(name: string): Promise<boolean> {
    const result = await this.findByField('name', name);
    return result.length > 0;
  }
}
