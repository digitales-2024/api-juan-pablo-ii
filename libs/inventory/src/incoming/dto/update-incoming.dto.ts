import { PartialType } from '@nestjs/mapped-types';
import { CreateIncomingDto } from './create-incoming.dto';

export class UpdateIncomingDto extends PartialType(CreateIncomingDto) {}
