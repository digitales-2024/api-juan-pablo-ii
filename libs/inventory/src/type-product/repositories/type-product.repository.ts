import { Injectable } from '@nestjs/common';
import { BaseRepository, PrismaService } from '@prisma/prisma';
import { TypeProductResponse } from '../entities/type-product.entity';

@Injectable()
export class TypeProductRepository extends BaseRepository<TypeProductResponse> {
  constructor(prisma: PrismaService) {
    super(prisma, 'tipoProducto'); // Tabla del esquema de prisma
  }
}
