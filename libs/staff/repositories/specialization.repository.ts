import { Injectable } from '@nestjs/common';
import { Specialization } from '../entities/staff.entity';
import { PrismaBaseRepository, PrismaService } from '@prisma/prisma';

@Injectable()
export class SpecializationRepository extends PrismaBaseRepository<Specialization> {
  constructor(prisma: PrismaService) {
    super(prisma, 'especialidad');
  }
}
