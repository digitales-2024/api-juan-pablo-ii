import { Injectable } from '@nestjs/common';
import { CreateBranchDto } from '../dto/create-branch.dto';
import { Branch } from '../entities/branch.entity';
import { BranchRepository } from '../repositories/branch.repository';
import { UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';

@Injectable()
export class CreateBranchUseCase {
  constructor(
    private readonly branchRepository: BranchRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    createBranchDto: CreateBranchDto,
    user: UserData,
  ): Promise<BaseApiResponse<Branch>> {
    const newBranch = await this.branchRepository.transaction(async () => {
      // Create branch
      const branch = await this.branchRepository.create({
        name: createBranchDto.name,
        address: createBranchDto.address,
        phone: createBranchDto.phone,
        isActive: true,
      });

      // Register audit
      await this.auditService.create({
        entityId: branch.id,
        entityType: 'branch',
        action: AuditActionType.CREATE,
        performedById: user.id,
        createdAt: new Date(),
      });

      return branch;
    });

    return {
      success: true,
      message: 'Sucursal creada exitosamente',
      data: newBranch,
    };
  }
}
