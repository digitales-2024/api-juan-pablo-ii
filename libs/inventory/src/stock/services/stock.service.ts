import { Injectable, Logger } from '@nestjs/common';
import { StockDto } from '../dto';

import { StockRepository } from '../repositories/stock.repository';
import { UpdateStockUseCase } from '../use-cases/update-storage.use-case';
import { CreateStockUseCase } from '../use-cases/create-storage.use-case';
import { UserData } from '@login/login/interfaces';

@Injectable()
export class StockService {
  private readonly logger = new Logger(StockService.name);

  constructor(
    private readonly stockRepository: StockRepository,
    private readonly updateStockUseCase: UpdateStockUseCase,
    private readonly createStockUseCase: CreateStockUseCase,
  ) {}

  // Función para obtener el stock de un producto en todos los almacenes
  async getStockByProduct(productId: string): Promise<StockDto[]> {
    try {
      const byStock = await this.stockRepository.getStockByIdStorageByIdProduct(
        undefined,
        productId,
      );
      return byStock;
    } catch (error) {
      this.logger.error(`Error fetching stock for product ${productId}`, error);
      throw error;
    }
  }

  // Función para obtener el stock de un almacén específico
  async getStockByStorage(storageId: string): Promise<StockDto[]> {
    try {
      const byStock =
        await this.stockRepository.getStockByIdStorageByIdProduct(storageId);
      return byStock;
    } catch (error) {
      this.logger.error(`Error fetching stock for storage ${storageId}`, error);
      throw error;
    }
  }

  // Función para obtener todos los stocks de todos los almacenes
  async getStockForAllStorages(): Promise<any> {
    try {
      const byStock =
        await this.stockRepository.getStockByIdStorageByIdProduct();
      return byStock;
    } catch (error) {
      this.logger.error('Error fetching stock for all storages', error);
      throw error;
    }
  }

  // Función para obtener el stock de un almacén específico y de un producto específico
  async getStockByStorageProduct(
    storageId: string,
    productId: string,
  ): Promise<StockDto> {
    try {
      const byStock = await this.stockRepository.getStockByIdStorageByIdProduct(
        storageId,
        productId,
      );
      return byStock;
    } catch (error) {
      this.logger.error(
        `Error fetching stock for storage ${storageId} and product ${productId}`,
        error,
      );
      throw error;
    }
  }

  //no tocar
  //funfion para actualizar el stock con el estock actual esta funcion es delicada si no se tiene un control correcto de ingresos y salidas en fisico
  async createOrUpdateStock(
    storageId: string,
    productId: string,
    quantity: number,
    user: UserData,
  ): Promise<void> {
    try {
      //ontener el stock actual
      const stockActual =
        await this.stockRepository.getStockByStorageAndProduct(
          storageId,
          productId,
        );
      //obtener el precio del producto por unidad
      const priceProduct =
        await this.stockRepository.getPriceProduct(productId);

      if (!priceProduct) {
        throw new Error(`Price not found for product ${productId}`);
      }

      const priceUnit = priceProduct.price;

      if (stockActual) {
        //obtener el id del stock
        const stockId = await this.stockRepository.getByIdStock(
          storageId,
          productId,
        );

        const IdStock = stockId.id;
        const newStock = stockActual.stock + quantity;
        const totalPrice = priceUnit * newStock;

        await this.updateStockUseCase.execute(
          IdStock,
          {
            storageId,
            productId,
            stock: newStock,
            price: totalPrice,
          },
          user,
        );
      } else {
        const totalPrice = priceUnit * quantity;

        await this.createStockUseCase.execute(
          {
            storageId,
            productId,
            stock: quantity,
            price: totalPrice,
          },
          user,
        );
      }
    } catch (error) {
      this.logger.error(
        `Error updating stock for product ${productId} in storage ${storageId}`,
        error,
      );
      throw error;
    }
  }
  //fin
}
