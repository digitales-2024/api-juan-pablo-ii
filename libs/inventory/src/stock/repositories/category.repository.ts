import { Injectable } from '@nestjs/common';
import { BaseRepository, PrismaService } from '@prisma/prisma';
import { Category } from '../entities/category.entity';

@Injectable()
export class CategoryRepository extends BaseRepository<Category> {
  constructor(prisma: PrismaService) {
    super(prisma, 'categoria'); // Tabla del esquema de prisma
  }
}
