import { Injectable } from '@nestjs/common';
import { BaseRepository, PrismaService } from '@prisma/prisma';
import { StaffType } from '../entities/staff.entity';

/**
 * Repositorio para la entidad StaffType
 * @extends {BaseRepository<StaffType>}
 */
@Injectable()
export class StaffTypeRepository extends BaseRepository<StaffType> {
  constructor(prisma: PrismaService) {
    super(prisma, 'staffType');
  }
}
