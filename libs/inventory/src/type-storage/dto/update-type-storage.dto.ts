import { PartialType } from '@nestjs/swagger';
import { CreateTypeStorageDto } from './create-type-storage.dto';

export class UpdateTypeStorageDto extends PartialType(CreateTypeStorageDto) {}
