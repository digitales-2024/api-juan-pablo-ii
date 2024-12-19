import { Injectable } from '@nestjs/common';
import { BaseRepository, PrismaService } from '@prisma/prisma';
import { Outgoing } from '../entities/outgoing.entity';

@Injectable()
export class OutgoingRepository extends BaseRepository<Outgoing> {
  constructor(prisma: PrismaService) {
    super(prisma, 'outgoing'); // Tabla del esquema de prisma
  }

  async getTotalByProduct(productId: string): Promise<number> {
    const total = await this.prisma.movement.aggregate({
      _sum: {
        quantity: true,
      },
      where: {
        productoId: productId,
        outgoingId: { not: null }, // Solo considerar movimientos vinculados a salidas
        state: true, // Solo registros confirmados
        isActive: true, // Solo registros activos
      },
    });

    return total._sum.quantity || 0; // Retornar 0 si no hay resultados
  }
}
