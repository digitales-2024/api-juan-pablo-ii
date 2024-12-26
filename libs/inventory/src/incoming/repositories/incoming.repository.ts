import { Injectable } from '@nestjs/common';
import { BaseRepository, PrismaService } from '@prisma/prisma';
import { Incoming } from '../entities/incoming.entity';

@Injectable()
export class IncomingRepository extends BaseRepository<Incoming> {
  constructor(prisma: PrismaService) {
    super(prisma, 'incoming'); // Tabla del esquema de prisma
  }

  // Función pública para obtener los productos y sus cantidades para ingresos
  async getProductsTotalQuantityIncoming(): Promise<{
    [key: string]: { cantidad: number };
  }> {
    const movements = await this.fetchMovementsForIncoming();
    const productQuantities = this.mapProductQuantities(movements);
    return productQuantities;
  }

  // Función privada para obtener los movimientos relacionados con ingresos
  private async fetchMovementsForIncoming() {
    return await this.prisma.movement.findMany({
      where: {
        incomingId: { not: null }, // Solo registros con incomingId no nulo
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
