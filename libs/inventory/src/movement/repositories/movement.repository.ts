import { Injectable } from '@nestjs/common';
import { BaseRepository, PrismaService } from '@prisma/prisma';
import { Movement } from '../entities/movement.entity';

@Injectable()
export class MovementRepository extends BaseRepository<Movement> {
  constructor(prisma: PrismaService) {
    super(prisma, 'movement'); // Tabla del esquema de prisma
  }
}
