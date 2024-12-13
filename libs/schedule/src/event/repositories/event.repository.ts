import { Injectable } from '@nestjs/common';
import { Event } from '../entities/event.entity';
import { PrismaBaseRepository, PrismaService } from '@prisma/prisma';

@Injectable()
export class EventRepository extends PrismaBaseRepository<Event> {
  constructor(prisma: PrismaService) {
    super(prisma, 'evento'); // Tabla del esquema de prisma
  }
}
