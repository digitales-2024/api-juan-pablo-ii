import { Injectable } from '@nestjs/common';
import { BaseRepository, PrismaService } from '@prisma/prisma';
import { Incoming } from '../entities/incoming.entity';

@Injectable()
export class IncomingRepository extends BaseRepository<Incoming> {
  constructor(prisma: PrismaService) {
    super(prisma, 'incoming'); // Tabla del esquema de prisma
  }

  async getTotalByProduct(productId: string): Promise<number> {
    const total = await this.prisma.movement.aggregate({
      _sum: {
        quantity: true,
      },
      where: {
        productoId: productId,
        incomingId: { not: null }, // Solo considerar movimientos vinculados a ingresos
        state: true, // Solo registros confirmados
        isActive: true, // Solo registros activos
      },
    });

    return total._sum.quantity || 0; // Retornar 0 si no hay resultados
  }

  async getProductsByStorage(storageId: string): Promise<{ id: string }[]> {
    const products = await this.prisma.incoming.findMany({
      where: {
        storageId,
        isActive: true, // Considerar solo registros activos
      },
      select: {
        Movement: {
          select: { productoId: true },
        },
      },
    });

    // Extraer IDs únicos de los productos
    return [
      ...new Set(
        products.flatMap((p) => p.Movement.map((m) => ({ id: m.productoId }))),
      ),
    ];
  }
}
