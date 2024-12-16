import { Injectable } from '@nestjs/common';
import { ServiceType } from '../entities/service.entity';
import { BaseRepository, PrismaService } from '@prisma/prisma';

@Injectable()
export class ServiceTypeRepository extends BaseRepository<ServiceType> {
  constructor(prisma: PrismaService) {
    super(prisma, 'serviceType');
  }
}
