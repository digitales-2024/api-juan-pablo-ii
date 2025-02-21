import { Injectable, Logger } from '@nestjs/common';
import { StockRepository } from '../repositories/stock.repository';
import { UpdateStockUseCase } from '../use-cases/update-stock.use-case';
import { CreateStockUseCase } from '../use-cases/create-stock.use-case';
import { UserData } from '@login/login/interfaces';
import { ProductStock, StockByStorage } from '../entities/stock.entity';
import { BaseErrorHandler } from 'src/common/error-handlers/service-error.handler';
import { stockErrorMessages } from '../errors/errors-stock';

@Injectable()
export class StockService {
  private readonly logger = new Logger(StockService.name);
  private readonly errorHandler: BaseErrorHandler;

  constructor(
    private readonly stockRepository: StockRepository,
    private readonly updateStockUseCase: UpdateStockUseCase,
    private readonly createStockUseCase: CreateStockUseCase,
  ) {
    this.errorHandler = new BaseErrorHandler(
      this.logger,
      'Stock',
      stockErrorMessages,
    );
  }

  // Función para obtener el stock de un producto en todos los almacenes
  async getStockByProduct(productId: string): Promise<StockByStorage[]> {
    try {
      const byStock = await this.stockRepository.getStockByIdStorageByIdProduct(
        undefined,
        productId,
      );
      if (byStock.length === 0) {
        throw new Error(
          `No se encontraró stock para el producto: ${productId} en ningun almacen`,
        );
      }
      return byStock;
    } catch (error) {
      this.logger.error(`Error fetching stock for product ${productId}`, error);
      this.errorHandler.handleError(error, 'getting');
      throw error;
    }
  }

  // Función para obtener el stock de un almacén específico
  async getStockByStorage(storageId: string): Promise<StockByStorage[]> {
    try {
      const byStock =
        await this.stockRepository.getStockByIdStorageByIdProduct(storageId);
      if (byStock.length === 0) {
        throw new Error(
          `No se encontro stock de productos para el almacen: ${storageId}`,
        );
      }
      return byStock;
    } catch (error) {
      this.logger.error(`Error fetching stock for storage ${storageId}`, error);
      this.errorHandler.handleError(error, 'getting');
      throw error;
    }
  }

  // Función para obtener todos los stocks de todos los almacenes
  async getStockForAllStorages(): Promise<StockByStorage[]> {
    try {
      const byStock =
        await this.stockRepository.getStockByIdStorageByIdProduct();
      if (byStock.length === 0) {
        throw new Error('No se encontro stock de productos en los almacenes');
      }
      return byStock;
    } catch (error) {
      this.logger.error('Error fetching stock for all storages', error);
      this.errorHandler.handleError(error, 'getting');
      throw error;
    }
  }

  // Función para obtener el stock de un almacén específico y de un producto específico
  async getStockByStorageProduct(
    storageId: string,
    productId: string,
  ): Promise<StockByStorage[]> {
    try {
      const byStock = await this.stockRepository.getStockByIdStorageByIdProduct(
        storageId,
        productId,
      );
      if (byStock.length === 0) {
        throw new Error(
          `No se encontro stock para el producto: ${productId} en el almacen: ${storageId}`,
        );
      }
      return byStock;
    } catch (error) {
      this.logger.error(
        `Error fetching stock for storage ${storageId} and product ${productId}`,
        error,
      );
      this.errorHandler.handleError(error, 'getting');
      throw error;
    }
  }

  //no tocar
  //funfion para actualizar el stock con el estock actual esta funcion es delicada si no se tiene un control correcto de ingresos en fisico
  async createOrUpdateStockIncoming(
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
      this.errorHandler.handleError(error, 'updating');
      throw error;
    }
  }
  //fin

  //funcion para actualizar el stock por las salidas esta funion es delicada si no se tiene un control correcto de salidas en fisico
  async updateStockOutgoing(
    storageId: string,
    productId: string,
    quantity: number,
    user: UserData,
  ): Promise<void> {
    try {
      // Obtener el stock actual
      const stockActual =
        await this.stockRepository.getStockByStorageAndProduct(
          storageId,
          productId,
        );

      // Verificar si el stock actual existe
      if (!stockActual) {
        throw new Error(
          `Stock not found for product ${productId} in storage ${storageId}`,
        );
      }

      // Obtener el precio del producto por unidad
      const priceProduct =
        await this.stockRepository.getPriceProduct(productId);

      if (!priceProduct) {
        throw new Error(`Price not found for product ${productId}`);
      }

      const priceUnit = priceProduct.price;

      // Verificar si el stock actual es suficiente para restar la cantidad
      if (stockActual.stock < quantity) {
        throw new Error(
          `Stock ${stockActual} insuficiente para el producto ${productId} en el almacén ${storageId}`,
        );
      }

      // Obtener el ID del stock
      const stockId = await this.stockRepository.getByIdStock(
        storageId,
        productId,
      );

      const IdStock = stockId.id;
      const newStock = stockActual.stock - quantity;
      const totalPrice = priceUnit * newStock;

      // Actualizar el stock
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
    } catch (error) {
      this.logger.error(
        `Error updating stock for product ${productId} in storage ${storageId}`,
        error,
      );
      this.errorHandler.handleError(error, 'updating');
      throw error;
    }
  }

  //funcion para obtener el stock de un producto en todos los almacenes
  async getProductStock(productId: string): Promise<ProductStock[]> {
    try {
      const productStock =
        await this.stockRepository.getOneProductStock(productId);
      return [productStock];
    } catch (error) {
      this.logger.error(`Error fetching stock for product ${productId}`, error);
      this.errorHandler.handleError(error, 'getting');
    }
  }

  //funcion para obtener todos los productos en stock en todos los almacenes
  async getProductsStock(): Promise<ProductStock[]> {
    try {
      const productsStock = await this.stockRepository.getAllProductsStock();
      return productsStock;
    } catch (error) {
      this.logger.error('Error fetching products stock', error);
      this.errorHandler.handleError(error, 'getting');
    }
  }

  async getProductsStockByStorage({
    storageId,
  }: {
    storageId: string;
  }): Promise<ProductStock[]> {
    try {
      const productStock = await this.stockRepository.getProductStockByStorage({
        storageId,
      });
      return productStock;
    } catch (error) {
      this.logger.error(`Error fetching stock for storage ${storageId}`);
      this.errorHandler.handleError(error, 'getting');
    }
  }
}
