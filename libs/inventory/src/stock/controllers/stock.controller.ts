import { Controller, Get, Param } from '@nestjs/common';
import { StockService } from '../services/stock.service';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { StockDto } from '../dto';

@ApiTags('Stock')
@Controller({ path: 'stock', version: '1' })
export class StockController {
  constructor(private readonly stockService: StockService) {}

  /**
   * Endpoint para obtener el stock de un producto específico por su ID.
   *
   * @param id - ID del producto a consultar.
   * @returns Una promesa que resuelve a un objeto `StockDto` con el stock total del producto.
   * @throws {NotFoundException} Si el producto con el ID proporcionado no existe.
   */
  @Get('product/:id')
  @ApiOperation({
    summary: 'Obtener stock de un producto por ID de todos los alamacenes',
  })
  @ApiParam({ name: 'id', description: 'ID del producto' })
  async getStockByProduct(@Param('id') id: string): Promise<StockDto> {
    return this.stockService.getStockByProduct(id);
  }

  /**
   * Endpoint para obtener el stock de todos los productos dentro de un almacén específico.
   *
   * @param id - ID del almacén a consultar.
   * @returns Una promesa que resuelve a un arreglo de objetos `StockDto`,
   * cada uno representando el stock de un producto en el almacén.
   * @throws {NotFoundException} Si el almacén con el ID proporcionado no existe.
   */
  @Get('storage/:id')
  @ApiOperation({ summary: 'Obtener stock por almacén por ID' })
  @ApiParam({ name: 'id', description: 'ID del almacén' })
  async getStockByStorage(@Param('id') id: string): Promise<StockDto[]> {
    return this.stockService.getStockByStorage(id);
  }

  /**
   * Endpoint para obtener el stock de todos los productos en todos los almacenes registrados.
   *
   * @returns Una promesa que resuelve a un arreglo de objetos `StockDto`,
   * consolidando el stock de todos los productos en todos los almacenes.
   * @throws {Error} Si ocurre algún problema al calcular el stock de los almacenes.
   */
  @Get('storages')
  @ApiOperation({ summary: 'Obtener stock de todos los almacenes' })
  async getStockForAllStorages(): Promise<StockDto[]> {
    return this.stockService.getStockForAllStorages();
  }

  // Endpoint para obtener un producto en un almacén específico
  @Get('storage/:storageId/product/:productId')
  @ApiOperation({ summary: 'Obtener stock por almacén y producto' })
  @ApiParam({ name: 'storageId', description: 'ID del almacén' })
  @ApiParam({ name: 'productId', description: 'ID del producto' })
  async getStockByStorageProduct(
    @Param('storageId') storageId: string,
    @Param('productId') productId: string,
  ): Promise<StockDto> {
    return this.stockService.getStockByStorageProduct(storageId, productId);
  }
}
