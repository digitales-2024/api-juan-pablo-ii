import { Injectable } from '@nestjs/common';
import { BaseRepository, PrismaService } from '@prisma/prisma';
import { Movement } from '../entities/movement.entity';

@Injectable()
export class MovementRepository extends BaseRepository<Movement> {
  constructor(prisma: PrismaService) {
    super(prisma, 'movement'); // Tabla del esquema de prisma
  }

  //inicio funcion para obtener solo los ids de los registros de esta tabla idProdcuto y quantity y el id del registro
  /*   async getProductsTotalQuantityMovement(): Promise<{
    [key: string]: { cantidad: number };
  }> {
    const movements = await this.fetchMovements();
    const productQuantities = this.mapProductQuantities(movements);
    return productQuantities;
  }

  // Función privada para obtener los movimientos
  private async fetchMovements() {
    return await this.prisma.movement.findMany({
      where: {
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
 */
  //fin funcion para obtener los movimientos netos de un producto

  // Función pública para obtener el stock por almacén
  async getStockByStorage(): Promise<any> {
    const storages = await this.fetchStorages();
    const stockByStorage = {};

    for (const storage of storages) {
      const incoming = await this.getProductsTotalQuantityIncoming(storage.id);
      const outgoing = await this.getProductsTotalQuantityOutgoing(storage.id);
      const typeStorage = await this.fetchTypeStorage(storage.typeStorageId);
      const branch = await this.fetchBranch(typeStorage.branchId);
      const staff = await this.fetchStaff(typeStorage.staffId);

      stockByStorage[storage.id] = {
        name: storage.name,
        location: storage.location,
        address: branch.address,
        staff: staff.name,
        description: typeStorage.description,
        incoming,
        outgoing,
      };
    }

    return { almacenes: stockByStorage };
  }

  // Función privada para obtener los almacenes
  private async fetchStorages() {
    return await this.prisma.storage.findMany({
      where: { isActive: true },
      select: { id: true, name: true, location: true, typeStorageId: true },
    });
  }

  // Función privada para obtener los productos y sus cantidades para ingresos
  private async getProductsTotalQuantityIncoming(
    storageId: string,
    productId?: string,
  ): Promise<{ [key: string]: { cantidad: number } }> {
    const incomings = await this.prisma.incoming.findMany({
      where: {
        storageId,
        state: true,
        isActive: true,
      },
      select: {
        id: true,
      },
    });

    const movements = await this.prisma.movement.findMany({
      where: {
        incomingId: { in: incomings.map((incoming) => incoming.id) },
        state: true,
        ...(productId ? { productoId: productId } : {}),
        isActive: true,
      },
      select: {
        productoId: true,
        quantity: true,
      },
    });

    return this.mapProductQuantities(movements);
  }

  // Función privada para obtener los productos y sus cantidades para salidas
  private async getProductsTotalQuantityOutgoing(
    storageId: string,
    productId?: string,
  ): Promise<{ [key: string]: { cantidad: number } }> {
    const outgoings = await this.prisma.outgoing.findMany({
      where: {
        storageId,
        state: true,
        isActive: true,
      },
      select: {
        id: true,
      },
    });

    const movements = await this.prisma.movement.findMany({
      where: {
        outgoingId: { in: outgoings.map((outgoing) => outgoing.id) },
        ...(productId ? { productoId: productId } : {}),
        state: true,
        isActive: true,
      },
      select: {
        productoId: true,
        quantity: true,
      },
    });

    const productQuantities = this.mapProductQuantities(movements);

    // Convertir las cantidades a negativas
    Object.keys(productQuantities).forEach((productoId) => {
      productQuantities[productoId].cantidad = -Math.abs(
        productQuantities[productoId].cantidad,
      );
    });

    return productQuantities;
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

  // Función privada para obtener los datos de TypeStorage
  private async fetchTypeStorage(typeStorageId: string) {
    return await this.prisma.typeStorage.findUnique({
      where: { id: typeStorageId },
      select: { description: true, branchId: true, staffId: true },
    });
  }

  // Función privada para obtener los datos de Sucursal
  private async fetchBranch(branchId: string) {
    return await this.prisma.sucursal.findUnique({
      where: { id: branchId },
      select: { address: true },
    });
  }

  // Función privada para obtener los datos de Personal
  private async fetchStaff(staffId: string) {
    return await this.prisma.personal.findUnique({
      where: { id: staffId },
      select: { name: true },
    });
  }
  //fin funcion

  // Función pública para obtener el stock por un almacén específico y un producto específico
  async getStockByStorageIdProductId(
    storageId: string,
    productId: string,
  ): Promise<any> {
    const storage = await this.fetchStorageById(storageId);
    const stockByStorage = {};

    const incoming = await this.getProductsTotalQuantityIncoming(
      storage.id,
      productId,
    );
    const outgoing = await this.getProductsTotalQuantityOutgoing(
      storage.id,
      productId,
    );
    const typeStorage = await this.fetchTypeStorage(storage.typeStorageId);
    const branch = await this.fetchBranch(typeStorage.branchId);
    const staff = await this.fetchStaff(typeStorage.staffId);

    stockByStorage[storage.id] = {
      name: storage.name,
      location: storage.location,
      address: branch.address,
      staff: staff.name,
      description: typeStorage.description,
      incoming,
      outgoing,
    };

    return { almacenes: stockByStorage };
  }

  // Función privada para obtener un almacén por su ID
  private async fetchStorageById(storageId: string) {
    return await this.prisma.storage.findUnique({
      where: { id: storageId, isActive: true },
      select: { id: true, name: true, location: true, typeStorageId: true },
    });
  }
  //fin funcion
}
