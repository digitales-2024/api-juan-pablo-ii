import { Injectable } from '@nestjs/common';
import { BaseRepository, PrismaService } from '@prisma/prisma';
import { TypeStorage } from '../entities/type-storage.entity';

@Injectable()
export class TypeStorageRepository extends BaseRepository<TypeStorage> {
  constructor(prisma: PrismaService) {
    super(prisma, 'typeStorage'); // Tabla del esquema de prisma
  }
}
