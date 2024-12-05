import { Injectable } from '@nestjs/common';
import { BaseRepository, PrismaService } from '@prisma/prisma';
import { Specialization } from '../entities/staff.entity';

@Injectable()
export class SpecializationRepository extends BaseRepository<Specialization> {
  constructor(prisma: PrismaService) {
    super(prisma, 'especialidad');
  }
}
