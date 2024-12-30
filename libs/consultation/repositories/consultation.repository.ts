import { Injectable } from '@nestjs/common';
import { Consultation } from '../entities/consultation.entity';
import { BaseRepository, PrismaService } from '@prisma/prisma';

@Injectable()
export class ConsultationRepository extends BaseRepository<Consultation> {
  constructor(prisma: PrismaService) {
    super(prisma, 'consultaMedica'); // Tabla del esquema de prisma
  }
}
