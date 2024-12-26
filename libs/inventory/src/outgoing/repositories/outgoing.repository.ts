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
        productId: true,
        quantity: true,
      },
    });
  }

  // Función privada para mapear las cantidades por producto
  private mapProductQuantities(
    movements: Array<{ productId: string; quantity: number }>,
  ): { [key: string]: { cantidad: number } } {
    const productQuantities: { [key: string]: { cantidad: number } } = {};

    movements.forEach((movement) => {
      this.initializeProductQuantity(productQuantities, movement.productId);
      this.updateProductQuantity(
        productQuantities,
        movement.productId,
        movement.quantity,
      );
    });

    // Convertir las cantidades a negativas
    Object.keys(productQuantities).forEach((productId) => {
      productQuantities[productId].cantidad = -Math.abs(
        productQuantities[productId].cantidad,
      );
    });

    return productQuantities;
  }

  // Función privada para inicializar la cantidad de un producto
  private initializeProductQuantity(
    productQuantities: { [key: string]: { cantidad: number } },
    productId: string,
  ) {
    if (!productQuantities[productId]) {
      productQuantities[productId] = { cantidad: 0 };
    }
  }

  // Función privada para actualizar la cantidad de un producto
  private updateProductQuantity(
    productQuantities: { [key: string]: { cantidad: number } },
    productId: string,
    quantity: number,
  ) {
    productQuantities[productId].cantidad += quantity;
  }
}
