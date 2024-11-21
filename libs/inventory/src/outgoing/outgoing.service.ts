import { Injectable } from '@nestjs/common';
import { CreateOutgoingDto } from './dto/create-outgoing.dto';
import { UpdateOutgoingDto } from './dto/update-outgoing.dto';

@Injectable()
export class OutgoingService {
  create(createOutgoingDto: CreateOutgoingDto) {
    return 'This action adds a new outgoing';
  }

  findAll() {
    return `This action returns all outgoing`;
  }

  findOne(id: number) {
    return `This action returns a #${id} outgoing`;
  }

  update(id: number, updateOutgoingDto: UpdateOutgoingDto) {
    return `This action updates a #${id} outgoing`;
  }

  remove(id: number) {
    return `This action removes a #${id} outgoing`;
  }
}
