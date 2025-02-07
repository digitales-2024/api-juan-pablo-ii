import { PartialType } from '@nestjs/swagger';
import { CreateMedicalHistoryDto } from './create-history.dto';

export class UpdateMedicalHistoryDto extends PartialType(
  CreateMedicalHistoryDto,
) {}
