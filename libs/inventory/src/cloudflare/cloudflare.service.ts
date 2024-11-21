import { Injectable } from '@nestjs/common';
import { CreateCloudflareDto } from './dto/create-cloudflare.dto';
import { UpdateCloudflareDto } from './dto/update-cloudflare.dto';

@Injectable()
export class CloudflareService {
  create(createCloudflareDto: CreateCloudflareDto) {
    return 'This action adds a new cloudflare';
  }

  findAll() {
    return `This action returns all cloudflare`;
  }

  findOne(id: number) {
    return `This action returns a #${id} cloudflare`;
  }

  update(id: number, updateCloudflareDto: UpdateCloudflareDto) {
    return `This action updates a #${id} cloudflare`;
  }

  remove(id: number) {
    return `This action removes a #${id} cloudflare`;
  }
}
