import { Injectable } from '@nestjs/common';
import { AppointmentType } from '../entities/appointment-type.entity';
import { BaseRepository, PrismaService } from '@prisma/prisma';

@Injectable()
export class AppointmentTypeRepository extends BaseRepository<AppointmentType> {
  constructor(prisma: PrismaService) {
    super(prisma, 'tipoCitaMedica');
  }
}
