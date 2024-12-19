import { Controller, Get, Param } from '@nestjs/common';
import { StockService } from '../services/stock.service';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { StockDto } from '../dto';

@ApiTags('Stock')
@Controller({ path: 'stock', version: '1' })
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Get('product/:id')
  @ApiOperation({ summary: 'Obtener stock de un producto por ID' })
  @ApiParam({ name: 'id', description: 'ID del producto' })
  async getStockByProduct(@Param('id') id: string): Promise<StockDto> {
    return this.stockService.getStockByProduct(id);
  }

  @Get('storage/:id')
  @ApiOperation({ summary: 'Obtener stock por almacén' })
  @ApiParam({ name: 'id', description: 'ID del almacén' })
  async getStockByStorage(@Param('id') id: string): Promise<StockDto[]> {
    return this.stockService.getStockByStorage(id);
  }
}
