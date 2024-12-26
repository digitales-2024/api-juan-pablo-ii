import { Injectable } from '@nestjs/common';
import { BaseRepository, PrismaService } from '@prisma/prisma';
import { Stock } from '../entities/stock.entity';

@Injectable()
export class StockRepository extends BaseRepository<Stock> {
  constructor(prisma: PrismaService) {
    super(prisma, 'stock'); // Tabla del esquema de prisma
  }
}
