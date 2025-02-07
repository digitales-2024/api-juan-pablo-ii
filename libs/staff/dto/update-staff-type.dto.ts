import { PartialType } from '@nestjs/swagger';
import { CreateStaffTypeDto } from './create-staff-type.dto';

export class UpdateStaffTypeDto extends PartialType(
  CreateStaffTypeDto,
) {}
