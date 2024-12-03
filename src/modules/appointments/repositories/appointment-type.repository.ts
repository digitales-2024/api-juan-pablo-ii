import { Injectable } from '@nestjs/common';
import { BaseRepository, PrismaService } from '@prisma/prisma';
import { AppointmentType } from '../entities/appointment-type.entity';

@Injectable()
export class AppointmentTypeRepository extends BaseRepository<AppointmentType> {
  constructor(prisma: PrismaService) {
    super(prisma, 'tipoCitaMedica');
  }
}
