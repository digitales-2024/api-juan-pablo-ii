import { Injectable } from '@nestjs/common';
import { BaseRepository, PrismaService } from '@prisma/prisma';
import { Outgoing } from '../entities/outgoing.entity';

@Injectable()
export class OutgoingRepository extends BaseRepository<Outgoing> {
  constructor(prisma: PrismaService) {
    super(prisma, 'outgoing'); // Tabla del esquema de prisma
  }

  // Función pública para obtener los productos y sus cantidades para salidas
  async getProductsTotalQuantityOutgoing(): Promise<{
    [key: string]: { cantidad: number };
  }> {
    const movements = await this.fetchMovementsForOutgoing();
    const productQuantities = this.mapProductQuantities(movements);
    return productQuantities;
  }

  // Función privada para obtener los movimientos relacionados con salidas
  private async fetchMovementsForOutgoing() {
    return await this.prisma.movement.findMany({
      where: {
        outgoingId: { not: null }, // Solo registros con outgoingId no nulo
        state: true, // Solo registros confirmados
        isActive: true, // Solo registros activos
      },
      select: {
        productoId: true,
        quantity: true,
      },
    });
  }

  // Función privada para mapear las cantidades por producto
  private mapProductQuantities(
    movements: Array<{ productoId: string; quantity: number }>,
  ): { [key: string]: { cantidad: number } } {
    const productQuantities: { [key: string]: { cantidad: number } } = {};

    movements.forEach((movement) => {
      this.initializeProductQuantity(productQuantities, movement.productoId);
      this.updateProductQuantity(
        productQuantities,
        movement.productoId,
        movement.quantity,
      );
    });

    // Convertir las cantidades a negativas
    Object.keys(productQuantities).forEach((productoId) => {
      productQuantities[productoId].cantidad = -Math.abs(
        productQuantities[productoId].cantidad,
      );
    });

    return productQuantities;
  }

  // Función privada para inicializar la cantidad de un producto
  private initializeProductQuantity(
    productQuantities: { [key: string]: { cantidad: number } },
    productoId: string,
  ) {
    if (!productQuantities[productoId]) {
      productQuantities[productoId] = { cantidad: 0 };
    }
  }

  // Función privada para actualizar la cantidad de un producto
  private updateProductQuantity(
    productQuantities: { [key: string]: { cantidad: number } },
    productoId: string,
    quantity: number,
  ) {
    productQuantities[productoId].cantidad += quantity;
  }
}
