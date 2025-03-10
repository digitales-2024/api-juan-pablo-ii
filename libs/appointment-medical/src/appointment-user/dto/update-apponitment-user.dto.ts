import { PartialType } from '@nestjs/swagger';
import { CreateAppointmentUserDto } from './create-apponitment-user.dto';

export class UpdateAppointmentUserDto extends PartialType(
  CreateAppointmentUserDto,
) {}
