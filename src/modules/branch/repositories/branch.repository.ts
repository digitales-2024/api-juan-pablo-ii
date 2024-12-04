import { Injectable } from '@nestjs/common';
import { BaseRepository, PrismaService } from '@prisma/prisma';
import { Branch } from '../entities/branch.entity';

@Injectable()
export class BranchRepository extends BaseRepository<Branch> {
  constructor(prisma: PrismaService) {
    super(prisma, 'sucursal'); // Matches the model name in schema.prisma
  }
}
