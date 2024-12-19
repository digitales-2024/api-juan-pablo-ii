import { Injectable } from '@nestjs/common';
import { BaseRepository, PrismaService } from '@prisma/prisma';
import { Movement } from '../entities/movement.entity';

@Injectable()
export class MovementRepository extends BaseRepository<Movement> {
  constructor(prisma: PrismaService) {
    super(prisma, 'movement'); // Tabla del esquema de prisma
  }

  async getNetMovementByProduct(productId: string): Promise<number> {
    const total = await this.prisma.movement.aggregate({
      _sum: {
        quantity: true,
      },
      where: {
        productoId: productId,
        incomingId: null, // Excluir ingresos
        outgoingId: null, // Excluir salidas
        state: true, // Solo registros confirmados
        isActive: true, // Solo registros activos
      },
    });

    return total._sum.quantity || 0; // Retornar 0 si no hay resultados
  }
}
