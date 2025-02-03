import { Injectable } from '@nestjs/common';
import { StorageRepository } from '../repositories/storage.repository';
import { Storage } from '../entities/storage.entity';
import { UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';
import { DeleteStorageDto } from '../dto/delete-storage.dto';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';

@Injectable()
export class DeleteStorageUseCase {
  constructor(
    private readonly storageRepository: StorageRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    deleteStorageDto: DeleteStorageDto,
    user: UserData,
  ): Promise<BaseApiResponse<Storage[]>> {
    const deletedStorages = await this.storageRepository.transaction(
      async () => {
        // Realiza el soft delete y obtiene los almacenes actualizados
        const storages = await this.storageRepository.softDeleteMany(
          deleteStorageDto.ids,
        );

        // Registra la auditoría para cada almacén eliminado
        await Promise.all(
          storages.map((storage) =>
            this.auditService.create({
              entityId: storage.id,
              entityType: 'almacen',
              action: AuditActionType.DELETE,
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
      message: 'Almacenes eliminados exitosamente',
      data: deletedStorages,
    };
  }
}
