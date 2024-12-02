import { HttpStatus, Injectable } from '@nestjs/common';
import { UpdateBranchDto } from '../dto/update-branch.dto';
import { Branch } from '../entities/branch.entity';
import { BranchRepository } from '../repositories/branch.repository';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';

@Injectable()
export class UpdateBranchUseCase {
  constructor(
    private readonly branchRepository: BranchRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    id: string,
    updateBranchDto: UpdateBranchDto,
    user: UserData,
  ): Promise<HttpResponse<Branch>> {
    const updatedBranch = await this.branchRepository.transaction(async () => {
      // Update branch
      const branch = await this.branchRepository.update(id, {
        name: updateBranchDto.name,
        address: updateBranchDto.address,
        phone: updateBranchDto.phone,
      });

      // Register audit
      await this.auditService.create({
        entityId: branch.id,
        entityType: 'branch',
        action: AuditActionType.UPDATE,
        performedById: user.id,
        createdAt: new Date(),
      });

      return branch;
    });

    return {
      statusCode: HttpStatus.OK,
      message: 'Sucursal actualizada exitosamente',
      data: updatedBranch,
    };
  }
}
