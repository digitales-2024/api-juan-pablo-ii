import { Injectable, Logger } from '@nestjs/common';
import { StockDto } from '../dto';
import { IncomingRepository } from '@inventory/inventory/incoming/repositories/incoming.repository';
import { OutgoingRepository } from '@inventory/inventory/outgoing/repositories/outgoing.repository';
import { MovementRepository } from '@inventory/inventory/movement/repositories/movement.repository';
import { StorageRepository } from '@inventory/inventory/storage/repositories/storage.repository';
import { IncomingService } from '@inventory/inventory/incoming/services/incoming.service';
import { OutgoingService } from '@inventory/inventory/outgoing/services/outgoing.service';
import { MovementService } from '@inventory/inventory/movement/services/movement.service';
import { StorageService } from '@inventory/inventory/storage/services/storage.service';

@Injectable()
export class StockService {
  private readonly logger = new Logger(StockService.name);

  constructor(
    private readonly incomingService: IncomingService,
    private readonly outgoingService: OutgoingService,
    private readonly movementService: MovementService,
    private readonly storageService: StorageService,
    private readonly storageRepository: StorageRepository,
    private readonly incomingRepository: IncomingRepository,
    private readonly outgoingRepository: OutgoingRepository,
    private readonly movementRepository: MovementRepository,
  ) {}

  //funcion para obtener el stock de un producto en todos los almacenes
  async getStockByProduct(productId: string): Promise<StockDto> {
    const incomingData =
      await this.incomingRepository.getProductsTotalQuantityIncoming();
    const outgoingData =
      await this.outgoingRepository.getProductsTotalQuantityOutgoing();
    //const movementData =
    //await this.movementRepository.getProductsTotalQuantityMovement();

    const incoming = incomingData[productId]?.cantidad || 0;
    const outgoing = outgoingData[productId]?.cantidad || 0;
    //const movements = movementData[productId]?.cantidad || 0;

    const totalStock = incoming + outgoing;

    return { productId, totalStock };
  }
  //fin funcion

  //funcion para obtener el stock en un almacen especifico

  async getStockByStorage(storageId: string): Promise<StockDto[]> {
    // Agrupar productos por almacén y calcular stock
    const productsInStorage =
      await this.storageRepository.getProductsByStorage(storageId);
    return Promise.all(
      productsInStorage.map(async (product) => {
        const stock = await this.getStockByProduct(product.id);
        return { ...stock, storageId };
      }),
    );
  }

  //fin funcion

  //funcion para obtener el stock de todos los almacenes
  async getStockForAllStorages(): Promise<any> {
    try {
      const stockByStorage = await this.movementRepository.getStockByStorage();
      console.log(stockByStorage);
      const updatedStockByStorage = this.updateStockInJson(stockByStorage);
      console.log(updatedStockByStorage);
      return updatedStockByStorage;
    } catch (error) {
      this.logger.error('Error fetching stock for all storages', error);
      throw error;
    }
  }

  // Función privada para calcular el stock de cada producto
  private calculateStock(
    incoming: { [key: string]: { cantidad: number } },
    outgoing: { [key: string]: { cantidad: number } },
  ): { [key: string]: { cantidad: number } } {
    const stock: { [key: string]: { cantidad: number } } = {};

    // Combinar las cantidades de incoming y outgoing
    this.mergeQuantities(stock, incoming);
    this.mergeQuantities(stock, outgoing, true);

    return stock;
  }

  // Función privada para combinar las cantidades de productos
  private mergeQuantities(
    stock: { [key: string]: { cantidad: number } },
    quantities: { [key: string]: { cantidad: number } },
    isOutgoing: boolean = false,
  ) {
    Object.keys(quantities).forEach((productId) => {
      if (!stock[productId]) {
        stock[productId] = { cantidad: 0 };
      }
      stock[productId].cantidad += isOutgoing
        ? -Math.abs(quantities[productId].cantidad)
        : quantities[productId].cantidad;
    });
  }

  // Función privada para actualizar el JSON con el stock calculado
  private updateStockInJson(stockByStorage: any): any {
    const updatedStockByStorage = { ...stockByStorage };

    Object.keys(updatedStockByStorage.almacenes).forEach((storageId) => {
      const storage = updatedStockByStorage.almacenes[storageId];
      const stock = this.calculateStock(storage.incoming, storage.outgoing);
      storage.stock = stock;
      delete storage.incoming;
      delete storage.outgoing;
    });

    return updatedStockByStorage;
  }
  //fin funcion

  // Función pública para obtener el stock por un almacén específico y un producto específico
  async getStockByStorageProduct(
    storageId: string,
    productId: string,
  ): Promise<StockDto> {
    try {
      const stockByStorage =
        await this.movementRepository.getStockByStorageIdProductId(
          storageId,
          productId,
        );
      console.log(JSON.stringify(stockByStorage, null, 2));
      const updatedStockByStorage = this.updateStockInJson(stockByStorage);
      console.log(JSON.stringify(updatedStockByStorage, null, 2));
      return updatedStockByStorage;
    } catch (error) {
      this.logger.error(
        `Error fetching stock for storage ${storageId} and product ${productId}`,
        error,
      );
      throw error;
    }
  }

  //fin funcion

  //funfion para actualizar el stock con el estock actual esta funcion es delicada si no se tiene un control correcto de ingresos y salidas en fisico
  /*   async updateStock(
    productId: string,
    stock: number,
    storageId?: string,
    
  ): Promise<void> {
    try {
      const stock = await this.getStockByProduct(productId);
      const updatedStock = stock.totalStock + quantity;
      await this.storageService.updateStock(productId, updatedStock, storageId);
    } catch (error) {
      this.logger.error(
        `Error updating stock for product ${productId} in storage ${storageId}`,
        error,
      );
      throw error;
    }
  } */
  //fin
}
