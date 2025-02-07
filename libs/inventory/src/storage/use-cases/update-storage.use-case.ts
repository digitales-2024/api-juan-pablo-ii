import { Injectable } from '@nestjs/common';
import { UpdateStorageDto } from '../dto/update-storage.dto';
import { Storage } from '../entities/storage.entity';
import { StorageRepository } from '../repositories/storage.repository';
import { UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';

@Injectable()
export class UpdateStorageUseCase {
  constructor(
    private readonly storageRepository: StorageRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    id: string,
    updateStorageDto: UpdateStorageDto,
    user: UserData,
  ): Promise<BaseApiResponse<Storage>> {
    const updatedStorage = await this.storageRepository.transaction(
      async () => {
        // Update storage
        const storage = await this.storageRepository.update(id, {
          name: updateStorageDto.name,
          location: updateStorageDto.location,
          typeStorageId: updateStorageDto.typeStorageId,
        });

        // Register audit
        await this.auditService.create({
          entityId: storage.id,
          entityType: 'almacen',
          action: AuditActionType.UPDATE,
          performedById: user.id,
          createdAt: new Date(),
        });

        return storage;
      },
    );

    return {
      success: true,
      message: 'Almacén actualizado exitosamente',
      data: updatedStorage,
    };
  }
}
