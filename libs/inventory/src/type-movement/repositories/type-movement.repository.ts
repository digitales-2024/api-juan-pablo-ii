import { Injectable } from '@nestjs/common';
import { BaseRepository, PrismaService } from '@prisma/prisma';
import { TypeMovement } from '../entities/type-movement.entity';

@Injectable()
export class TypeMovementRepository extends BaseRepository<TypeMovement> {
  constructor(prisma: PrismaService) {
    super(prisma, 'movementType'); // Tabla del esquema de prisma
  }
}
