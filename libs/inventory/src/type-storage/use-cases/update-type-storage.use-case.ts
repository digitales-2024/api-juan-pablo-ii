import { Injectable } from '@nestjs/common';
import { UpdateTypeStorageDto } from '../dto/update-type-storage.dto';
import { TypeStorage } from '../entities/type-storage.entity';
import { TypeStorageRepository } from '../repositories/type-storage.repository';
import { UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';

@Injectable()
export class UpdateTypeStorageUseCase {
  constructor(
    private readonly typeStorageRepository: TypeStorageRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    id: string,
    updateTypeStorageDto: UpdateTypeStorageDto,
    user: UserData,
  ): Promise<BaseApiResponse<TypeStorage>> {
    const updatedTypeStorage = await this.typeStorageRepository.transaction(
      async () => {
        // Update type storage
        const typeStorage = await this.typeStorageRepository.update(id, {
          name: updateTypeStorageDto.name,
          description: updateTypeStorageDto.description,
          branchId: updateTypeStorageDto.branchId,
          staffId: updateTypeStorageDto.staffId,
        });

        // Register audit
        await this.auditService.create({
          entityId: typeStorage.id,
          entityType: 'typeStorage',
          action: AuditActionType.UPDATE,
          performedById: user.id,
          createdAt: new Date(),
        });

        return typeStorage;
      },
    );

    return {
      success: true,
      message: 'Tipo de almacenamiento actualizado exitosamente',
      data: updatedTypeStorage,
    };
  }
}
