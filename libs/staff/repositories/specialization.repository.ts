import { Injectable } from '@nestjs/common';
import { Specialization } from '../entities/staff.entity';
import { BaseRepository, PrismaService } from '@prisma/prisma';

@Injectable()
export class SpecializationRepository extends BaseRepository<Specialization> {
  constructor(prisma: PrismaService) {
    super(prisma, 'especialidad');
  }
}
