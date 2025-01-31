import { Injectable } from '@nestjs/common';
import { StorageRepository } from '../repositories/storage.repository';
import { Storage } from '../entities/storage.entity';
import { UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';

@Injectable()
export class ReactivateStorageUseCase {
  constructor(
    private readonly storageRepository: StorageRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    ids: string[],
    user: UserData,
  ): Promise<BaseApiResponse<Storage[]>> {
    // Reactivar los almacenes y registrar auditoría
    const reactivatedStorages = await this.storageRepository.transaction(
      async () => {
        const storages = await this.storageRepository.reactivateMany(ids);

        // Registrar auditoría para cada almacén reactivado
        await Promise.all(
          storages.map((storage) =>
            this.auditService.create({
              entityId: storage.id,
              entityType: 'almacen',
              action: AuditActionType.UPDATE,
              performedById: user.id,
              createdAt: new Date(),
            }),
          ),
        );

        return storages;
      },
    );

    return {
      success: true,
      message: 'Almacenes reactivados exitosamente',
      data: reactivatedStorages,
    };
  }
}
