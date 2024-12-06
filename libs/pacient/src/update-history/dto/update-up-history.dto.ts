import { PartialType } from '@nestjs/swagger';
import { CreateUpHistoryDto } from './create-up-history.dto';

export class UpdateUpHistoryDto extends PartialType(CreateUpHistoryDto) {}
