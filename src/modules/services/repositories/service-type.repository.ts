import { Injectable } from '@nestjs/common';
import { BaseRepository, PrismaService } from '@prisma/prisma';
import { ServiceType } from '../entities/service.entity';

@Injectable()
export class ServiceTypeRepository extends BaseRepository<ServiceType> {
  constructor(prisma: PrismaService) {
    super(prisma, 'serviceType');
  }
}
