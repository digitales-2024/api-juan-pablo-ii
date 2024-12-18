import { Injectable } from '@nestjs/common';
import { BaseRepository, PrismaService } from '@prisma/prisma';
import { Incoming } from '../entities/incoming.entity';

@Injectable()
export class IncomingRepository extends BaseRepository<Incoming> {
  constructor(prisma: PrismaService) {
    super(prisma, 'incoming'); // Tabla del esquema de prisma
  }
}
