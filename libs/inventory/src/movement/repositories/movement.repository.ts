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

  /**
   * Calcula el movimiento neto de un producto específico, excluyendo ingresos y salidas.
   *
   * @param productId - El identificador único del producto para el cual se desea calcular el movimiento neto.
   * @returns Una promesa que resuelve a un número que representa la cantidad neta de movimientos del producto.
   *
   * @example
   * ```typescript
   * const netMovement = await movementRepository.getNetMovementByProduct('prod123');
   * console.log(netMovement); // 15
   * ```
   *
   * @remarks
   * Esta función realiza una consulta en la tabla `movement` de la base de datos utilizando Prisma, con los siguientes filtros:
   * - Se excluyen los registros asociados a ingresos (`incomingId: null`) y salidas (`outgoingId: null`).
   * - Solo se consideran los movimientos confirmados (`state: true`) y activos (`isActive: true`).
   * - Los movimientos se agregan sumando la columna `quantity`.
   *
   * Si no existen movimientos que cumplan los criterios, la función retorna `0`.
   *
   * @throws {Error} Si ocurre algún problema durante la consulta a la base de datos.
   */
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

    // Mostrar el resultado de la búsqueda en consola
    console.log(`Total net movement for product ${productId}:`, total);

    return total._sum.quantity || 0; // Retornar 0 si no hay resultados
  }

  //inicio funcion obtener todos los almacenes y cantidades de productos

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

  /**
   * Obtiene el total de unidades retiradas para un producto específico.
   *
   * @param productId - El identificador único del producto para el cual se desea calcular el total de salidas.
   * @returns Una promesa que resuelve a un número que representa la cantidad total de unidades retiradas para el producto.
   * Si no hay registros encontrados, devuelve 0.
   *
   * @example
   * ```typescript
   * const totalSalidas = await outgoingRepository.getTotalByProduct('12345');
   * console.log(totalSalidas); // 30
   * ```
   *
   * @remarks
   * La función realiza una consulta en la base de datos utilizando el repositorio de movimientos (`prisma.movement`)
   * y filtra los registros que cumplen con los siguientes criterios:
   * - Asociados al producto especificado (`productoId`).
   * - Movimientos vinculados a salidas (`outgoingId` no es nulo).
   * - Movimientos en estado confirmado (`state` es verdadero).
   * - Movimientos activos (`isActive` es verdadero).
   *
   * @throws {Error} Si ocurre algún problema con la consulta a la base de datos.
   */
  async getTotalByProductOutgoing(productId: string): Promise<number> {
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

  /**
   * Obtiene el total de unidades ingresadas para un producto específico.
   *
   * @param productId - El identificador único del producto para el cual se desea calcular el total de ingresos.
   * @returns Una promesa que resuelve a un número que representa la cantidad total de unidades ingresadas para el producto.
   * Si no hay registros encontrados, devuelve 0.
   *
   * @example
   * ```typescript
   * const totalIngresos = await incomingRepository.getTotalByProduct('12345');
   * console.log(totalIngresos); // 50
   * ```
   *
   * @remarks
   * La función realiza una consulta en la base de datos utilizando el repositorio de movimientos (`prisma.movement`)
   * y filtra los registros que cumplen con los siguientes criterios:
   * - Asociados al producto especificado (`productoId`).
   * - Movimientos vinculados a ingresos (`incomingId` no es nulo).
   * - Movimientos en estado confirmado (`state` es verdadero).
   * - Movimientos activos (`isActive` es verdadero).
   *
   * @throws {Error} Si ocurre algún problema con la consulta a la base de datos.
   */
  async getTotalByProductIncoming(productId: string): Promise<number> {
    const total = await this.prisma.movement.aggregate({
      _sum: {
        quantity: true,
      },
      where: {
        productoId: productId,
        incomingId: { not: null }, //Solo considerar movimientos vinculados a ingresos
        state: true, //Solo registros confirmados
        isActive: true, //Solo registros activos
      },
    });

    return total._sum.quantity || 0; // Retornar 0 si no hay resultados
  }
}
