import { Injectable } from '@nestjs/common';
import { BaseRepository, PrismaService } from '@prisma/prisma';
import { Outgoing } from '../entities/outgoing.entity';

@Injectable()
export class OutgoingRepository extends BaseRepository<Outgoing> {
  constructor(prisma: PrismaService) {
    super(prisma, 'outgoing'); // Tabla del esquema de prisma
  }
}
