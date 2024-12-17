import { Injectable } from '@nestjs/common';
import { BaseRepository, PrismaService } from '@prisma/prisma';
import { Storage } from '../entities/storage.entity';

@Injectable()
export class StorageRepository extends BaseRepository<Storage> {
  constructor(prisma: PrismaService) {
    super(prisma, 'storage'); // Tabla del esquema de prisma
  }
}
