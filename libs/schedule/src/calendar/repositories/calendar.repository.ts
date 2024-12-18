// calendar.repository.ts
import { Injectable } from '@nestjs/common';
import { Calendar } from '../entities/pacient.entity';
import { BaseRepository, PrismaService } from '@prisma/prisma';

@Injectable()
export class CalendarRepository extends BaseRepository<Calendar> {
  constructor(prisma: PrismaService) {
    super(prisma, 'calendario'); // Tabla del esquema de prisma
  }
}
