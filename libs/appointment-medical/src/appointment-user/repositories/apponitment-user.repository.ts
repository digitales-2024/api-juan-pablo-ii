import { Injectable } from '@nestjs/common';
import { AppointmentMedicalResponse } from '../entities/apponitment-user..entity';
import { BaseRepository, PrismaService } from '@prisma/prisma';

@Injectable()
export class ApponitmentUserRepository extends BaseRepository<AppointmentMedicalResponse> {
  constructor(prisma: PrismaService) {
    super(prisma, 'appointment'); // Tabla del esquema de prisma
  }
}
