import { Injectable } from '@nestjs/common';
import { AppointmentType } from '../entities/appointment-type.entity';
import { PrismaBaseRepository, PrismaService } from '@prisma/prisma';

@Injectable()
export class AppointmentTypeRepository extends PrismaBaseRepository<AppointmentType> {
  constructor(prisma: PrismaService) {
    super(prisma, 'tipoCitaMedica');
  }
}
