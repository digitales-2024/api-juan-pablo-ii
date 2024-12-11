import { Injectable } from '@nestjs/common';
import { BaseRepository, PrismaService } from '@prisma/prisma';
import { Category } from '../entities/category.entity';

@Injectable()
export class CategoryRepository extends BaseRepository<Category> {
  constructor(prisma: PrismaService) {
    super(prisma, 'categoria'); // Tabla del esquema de prisma
  }
  /**
   * Verifica si existe un tipo de producto con el nombre especificado
   * @param name - Nombre a buscar
   * @returns true si existe el tipo de producto, false si no existe
   */
  async findExistName(name: string): Promise<boolean> {
    const result = await this.findByField('name', name);
    return result.length > 0;
  }
}
