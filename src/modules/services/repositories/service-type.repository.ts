import { Injectable } from '@nestjs/common';
import { ServiceType } from '../entities/service.entity';
import { PrismaBaseRepository, PrismaService } from '@prisma/prisma';

@Injectable()
export class ServiceTypeRepository extends PrismaBaseRepository<ServiceType> {
  constructor(prisma: PrismaService) {
    super(prisma, 'serviceType');
  }
}
