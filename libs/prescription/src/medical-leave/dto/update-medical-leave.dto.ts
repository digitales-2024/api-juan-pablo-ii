import { PartialType } from '@nestjs/mapped-types';
import { CreateMedicalLeaveDto } from './create-medical-leave.dto';

export class UpdateMedicalLeaveDto extends PartialType(CreateMedicalLeaveDto) {}
