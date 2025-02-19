import { Injectable } from '@nestjs/common';
import { CreateTypeStorageDto } from '../dto/create-type-storage.dto';
import { TypeStorage } from '../entities/type-storage.entity';
import { TypeStorageRepository } from '../repositories/type-storage.repository';
import { UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';

@Injectable()
export class CreateTypeStorageUseCase {
  constructor(
    private readonly typeStorageRepository: TypeStorageRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    createTypeStorageDto: CreateTypeStorageDto,
    user: UserData,
  ): Promise<BaseApiResponse<TypeStorage>> {
    const newTypeStorage = await this.typeStorageRepository.transaction(
      async () => {
        // Create type storage
        const typeStorage = await this.typeStorageRepository.create({
          name: createTypeStorageDto.name,
          description: createTypeStorageDto.description,
          // branchId:
          //   createTypeStorageDto.branchId.length === 0 ||
          //   !createTypeStorageDto.branchId
          //     ? null
          //     : createTypeStorageDto.branchId,
          // staffId:
          //   createTypeStorageDto.staffId.length === 0 ||
          //   !createTypeStorageDto.staffId
          //     ? null
          //     : createTypeStorageDto.staffId,
        });

        // Register audit
        await this.auditService.create({
          entityId: typeStorage.id,
          entityType: 'typeStorage',
          action: AuditActionType.CREATE,
          performedById: user.id,
          createdAt: new Date(),
        });

        return typeStorage;
      },
    );

    return {
      success: true,
      message: 'Tipo de almacenamiento creado exitosamente',
      data: newTypeStorage,
    };
  }
}
