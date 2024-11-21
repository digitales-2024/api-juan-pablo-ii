import { PartialType } from '@nestjs/mapped-types';
import { CreateOutgoingDto } from './create-outgoing.dto';

export class UpdateOutgoingDto extends PartialType(CreateOutgoingDto) {}
