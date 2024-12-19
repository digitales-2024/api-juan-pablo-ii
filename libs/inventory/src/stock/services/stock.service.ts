import { Injectable, Logger } from '@nestjs/common';
import { StockDto } from '../dto';
import { IncomingRepository } from '@inventory/inventory/incoming/repositories/incoming.repository';
import { OutgoingRepository } from '@inventory/inventory/outgoing/repositories/outgoing.repository';
import { MovementRepository } from '@inventory/inventory/movement/repositories/movement.repository';

@Injectable()
export class StockService {
  private readonly logger = new Logger(StockService.name);

  constructor(
    private readonly incomingRepository: IncomingRepository,
    private readonly outgoingRepository: OutgoingRepository,
    private readonly movementRepository: MovementRepository,
  ) {}

  async getStockByProduct(productId: string): Promise<StockDto> {
    const incoming = await this.incomingRepository.getTotalByProduct(productId);
    const outgoing = await this.outgoingRepository.getTotalByProduct(productId);
    const movements =
      await this.movementRepository.getNetMovementByProduct(productId);

    const totalStock = incoming - outgoing + movements;
    return { productId, totalStock };
  }

  async getStockByStorage(storageId: string): Promise<StockDto[]> {
    // Agrupar productos por almacén y calcular stock
    const productsInStorage =
      await this.incomingRepository.getProductsByStorage(storageId);
    return Promise.all(
      productsInStorage.map(async (product) => {
        const stock = await this.getStockByProduct(product.id);
        return { ...stock, storageId };
      }),
    );
  }
}
