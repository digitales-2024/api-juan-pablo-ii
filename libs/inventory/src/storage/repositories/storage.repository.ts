import { Injectable } from '@nestjs/common';
import { BaseRepository, PrismaService } from '@prisma/prisma';
import { Storage } from '../entities/storage.entity';

@Injectable()
export class StorageRepository extends BaseRepository<Storage> {
  constructor(prisma: PrismaService) {
    super(prisma, 'storage'); // Tabla del esquema de prisma
  }

  /**
   * Obtiene la lista de todos los almacenes activos registrados en la base de datos.
   *
   * @returns Una promesa que resuelve a un arreglo de objetos que contienen el `id` y el `name` de cada almacén activo.
   *
   * @example
   * ```typescript
   * const storages = await storageRepository.getAllStorages();
   * console.log(storages); // [{ id: '1', name: 'Almacén Central' }, { id: '2', name: 'Almacén Secundario' }]
   * ```
   *
   * @remarks
   * La función realiza una consulta en la tabla `storage` de la base de datos utilizando Prisma,
   * aplicando un filtro para obtener únicamente los almacenes que están marcados como activos (`isActive: true`).
   *
   * @throws {Error} Si ocurre algún problema con la consulta a la base de datos.
   */
  async getAllStorages(): Promise<{ id: string; name: string }[]> {
    return this.prisma.storage.findMany({
      where: { isActive: true }, // Considerar almacenes activos
      select: { id: true, name: true },
    });
  }

  /**
   * Obtiene una lista de productos únicos almacenados en un almacén específico.
   *
   * @param storageId - El identificador único del almacén del cual se desean obtener los productos.
   * @returns Una promesa que resuelve a un arreglo de objetos que contienen el `id` de cada producto único en el almacén.
   *
   * @example
   * ```typescript
   * const products = await storageRepository.getProductsByStorage('12345');
   * console.log(products); // [{ id: 'prod1' }, { id: 'prod2' }]
   * ```
   *
   * @remarks
   * La función realiza una consulta en la tabla `incoming` de la base de datos utilizando Prisma, considerando los siguientes criterios:
   * - Filtra los registros asociados al almacén especificado por `storageId`.
   * - Considera solo registros marcados como activos (`isActive: true`).
   * - Selecciona los movimientos (`Movement`) relacionados para obtener los identificadores de los productos (`productId`).
   * - Elimina duplicados para devolver solo los identificadores únicos de los productos.
   *
   * @throws {Error} Si ocurre algún problema con la consulta a la base de datos.
   */
  async getProductsByStorage(storageId: string): Promise<{ id: string }[]> {
    const products = await this.prisma.incoming.findMany({
      where: {
        storageId,
        isActive: true, // Considerar solo registros activos
      },
      select: {
        Movement: {
          select: { productId: true },
        },
      },
    });

    // Extraer IDs únicos de los productos
    return [
      ...new Set(
        products.flatMap((p) => p.Movement.map((m) => ({ id: m.productId }))),
      ),
    ];
  }

  /**
   * Obtiene el stock de un producto específico en un almacén específico.
   *
   * @param storageId - El identificador único del almacén.
   * @param productId - El identificador único del producto.
   * @returns Una promesa que resuelve al stock del producto en el almacén.
   *
   * @example
   * ```typescript
   * const stock = await storageRepository.getStockByStorageAndProduct('12345', 'prod1');
   * console.log(stock); // { stock: 100 }
   * ```
   *
   * @throws {Error} Si ocurre algún problema con la consulta a la base de datos.
   */
  async getStockByStorageAndProduct(
    storageId: string,
    productId: string,
  ): Promise<{ stock: number }> {
    return this.prisma.storage.findUnique({
      where: {
        id: storageId,
        productId: productId,
      },
      select: { stock: true },
    });
  }
}
