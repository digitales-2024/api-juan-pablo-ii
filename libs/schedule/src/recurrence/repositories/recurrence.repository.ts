import { Injectable } from '@nestjs/common';
import { Recurrence } from '../entities/recurrence.entity';
import { BaseRepository, PrismaService } from '@prisma/prisma';

@Injectable()
export class RecurrenceRepository extends BaseRepository<Recurrence> {
  constructor(prisma: PrismaService) {
    super(prisma, 'recurrence'); // Tabla del esquema de prisma
  }
}
