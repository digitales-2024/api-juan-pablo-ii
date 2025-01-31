import { PartialType } from '@nestjs/swagger';
import { CreatePrescriptionDto } from './create-recipe.dto';

export class UpdatePrescriptionDto extends PartialType(CreatePrescriptionDto) {}