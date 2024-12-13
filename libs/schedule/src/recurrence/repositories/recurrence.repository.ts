import { Injectable } from '@nestjs/common';
import { Recurrence } from '../entities/recurrence.entity';
import { PrismaBaseRepository, PrismaService } from '@prisma/prisma';

@Injectable()
export class RecurrenceRepository extends PrismaBaseRepository<Recurrence> {
  constructor(prisma: PrismaService) {
    super(prisma, 'recurrencia'); // Tabla del esquema de prisma
  }
}
