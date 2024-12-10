import { PartialType } from '@nestjs/swagger';
import { CreatePacienteDto } from './create-category.dto';

export class UpdatePacientDto extends PartialType(CreatePacienteDto) {}
