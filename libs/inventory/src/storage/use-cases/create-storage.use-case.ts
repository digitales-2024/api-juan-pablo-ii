import { Injectable } from '@nestjs/common';
import { CreateStorageDto } from '../dto/create-storage.dto';
import { Storage } from '../entities/storage.entity';
import { StorageRepository } from '../repositories/storage.repository';
import { UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';

@Injectable()
export class CreateStorageUseCase {
  constructor(
    private readonly storageRepository: StorageRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    createStorageDto: CreateStorageDto,
    user: UserData,
  ): Promise<BaseApiResponse<Storage>> {
    const newStorage = await this.storageRepository.transaction(async () => {
      // Create storage
      const storage = await this.storageRepository.create({
        name: createStorageDto.name,
        location: createStorageDto.location,
        typeStorageId: createStorageDto.typeStorageId,
      });

      // Register audit
      await this.auditService.create({
        entityId: storage.id,
        entityType: 'almacen',
        action: AuditActionType.CREATE,
        performedById: user.id,
        createdAt: new Date(),
      });

      return storage;
    });

    return {
      success: true,
      message: 'Almacén creado exitosamente',
      data: newStorage,
    };
  }
}
