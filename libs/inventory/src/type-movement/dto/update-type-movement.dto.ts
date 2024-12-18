import { PartialType } from '@nestjs/swagger';
import { CreateTypeMovementDto } from './create-type-movement.dto';

export class UpdateTypeMovementDto extends PartialType(CreateTypeMovementDto) {}
