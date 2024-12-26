import { PartialType } from '@nestjs/swagger';
import { CreateStockDto } from './create-stock.dto';

export class UpdateStorageDto extends PartialType(CreateStockDto) {}
