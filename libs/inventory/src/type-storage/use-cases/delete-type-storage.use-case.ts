import { Injectable } from '@nestjs/common';
import { TypeStorageRepository } from '../repositories/type-storage.repository';
import { TypeStorage } from '../entities/type-storage.entity';
import { UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';
import { DeleteTypeStorageDto } from '../dto/delete-type-storage.dto';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';

@Injectable()
export class DeleteTypeStorageUseCase {
  constructor(
    private readonly typeStorageRepository: TypeStorageRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    deleteTypeStorageDto: DeleteTypeStorageDto,
    user: UserData,
  ): Promise<BaseApiResponse<TypeStorage[]>> {
    const deletedTypeStorages = await this.typeStorageRepository.transaction(
      async () => {
        // Realiza el soft delete y obtiene los tipos de almacenamiento actualizados
        const typeStorages = await this.typeStorageRepository.softDeleteMany(
          deleteTypeStorageDto.ids,
        );

        // Registra la auditoría para cada tipo de almacenamiento eliminado
        await Promise.all(
          typeStorages.map((typeStorage) =>
            this.auditService.create({
              entityId: typeStorage.id,
              entityType: 'typeStorage',
              action: AuditActionType.DELETE,
              performedById: user.id,
              createdAt: new Date(),
            }),
          ),
        );

        return typeStorages;
      },
    );

    return {
      success: true,
      message: 'Tipos de almacenamiento eliminados exitosamente',
      data: deletedTypeStorages,
    };
  }
}
