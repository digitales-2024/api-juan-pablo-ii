import { Injectable } from '@nestjs/common';
import { BaseRepository, PrismaService } from '@prisma/prisma';
import { Event } from '../entities/event.entity';

@Injectable()
export class EventRepository extends BaseRepository<Event> {
  constructor(prisma: PrismaService) {
    super(prisma, 'evento'); // Tabla del esquema de prisma
  }
}
