import { Injectable } from '@nestjs/common';
import { BaseRepository, PrismaService } from '@prisma/prisma';
import { Paciente } from '../entities/pacient.entity';

@Injectable()
export class PacientRepository extends BaseRepository<Paciente> {
  constructor(prisma: PrismaService) {
    super(prisma, 'paciente'); // Tabla del esquema de prisma
  }
}
