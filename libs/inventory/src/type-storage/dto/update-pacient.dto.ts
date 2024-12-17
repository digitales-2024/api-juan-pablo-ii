import { PartialType } from '@nestjs/swagger';
import { CreatePacienteDto } from './create-pacient.dto';

export class UpdatePacientDto extends PartialType(CreatePacienteDto) {}
