import { Injectable } from '@nestjs/common';
import { TypeStorageRepository } from '../repositories/type-storage.repository';
import { TypeStorage } from '../entities/type-storage.entity';
import { UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';

@Injectable()
export class ReactivateTypeStorageUseCase {
  constructor(
    private readonly typeStorageRepository: TypeStorageRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    ids: string[],
    user: UserData,
  ): Promise<BaseApiResponse<TypeStorage[]>> {
    // Reactivar los tipos de almacenamiento y registrar auditoría
    const reactivatedTypeStorages =
      await this.typeStorageRepository.transaction(async () => {
        const typeStorages =
          await this.typeStorageRepository.reactivateMany(ids);

        // Registrar auditoría para cada tipo de almacenamiento reactivado
        await Promise.all(
          typeStorages.map((typeStorage) =>
            this.auditService.create({
              entityId: typeStorage.id,
              entityType: 'typeStorage',
              action: AuditActionType.UPDATE,
              performedById: user.id,
              createdAt: new Date(),
            }),
          ),
        );

        return typeStorages;
      });

    return {
      success: true,
      message: 'Tipos de almacenamiento reactivados exitosamente',
      data: reactivatedTypeStorages,
    };
  }
}
