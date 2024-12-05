import { Injectable } from '@nestjs/common';
import { BaseRepository, PrismaService } from '@prisma/prisma';
import { Recurrence } from '../entities/recurrence.entity';

@Injectable()
export class RecurrenceRepository extends BaseRepository<Recurrence> {
  constructor(prisma: PrismaService) {
    super(prisma, 'recurrencia'); // Tabla del esquema de prisma
  }
}
