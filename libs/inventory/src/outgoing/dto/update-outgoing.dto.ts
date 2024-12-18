import { PartialType } from '@nestjs/swagger';
import { CreateOutgoingDto } from './create-outgoing.dto';

export class UpdateOutgoingDto extends PartialType(CreateOutgoingDto) {}
