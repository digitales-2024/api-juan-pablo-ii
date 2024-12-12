import { Injectable } from '@nestjs/common';
import { BaseRepository, PrismaService } from '@prisma/prisma';
import { TypeProduct } from '../entities/type-product.entity';

@Injectable()
export class TypeProductRepository extends BaseRepository<TypeProduct> {
  constructor(prisma: PrismaService) {
    super(prisma, 'tipoProducto'); // Tabla del esquema de prisma
  }
}
