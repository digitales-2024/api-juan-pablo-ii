import { PartialType } from '@nestjs/swagger';
import { CreatePatientDto } from './create-pacient.dto';

export class UpdatePatientDto extends PartialType(CreatePatientDto) {
  id?: string;
  image?: undefined;
}
