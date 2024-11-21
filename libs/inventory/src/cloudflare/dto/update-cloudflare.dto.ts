import { PartialType } from '@nestjs/mapped-types';
import { CreateCloudflareDto } from './create-cloudflare.dto';

export class UpdateCloudflareDto extends PartialType(CreateCloudflareDto) {}
