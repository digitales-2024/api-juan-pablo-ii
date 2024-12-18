import { Injectable } from '@nestjs/common';
import { Event } from '../entities/event.entity';
import { BaseRepository, PrismaService } from '@prisma/prisma';

@Injectable()
export class EventRepository extends BaseRepository<Event> {
  constructor(prisma: PrismaService) {
    super(prisma, 'evento'); // Tabla del esquema de prisma
  }
}
