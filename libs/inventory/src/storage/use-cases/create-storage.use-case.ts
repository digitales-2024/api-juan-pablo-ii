import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateStorageDto } from '../dto/create-storage.dto';
import { Storage } from '../entities/storage.entity';
import { StorageRepository } from '../repositories/storage.repository';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';

@Injectable()
export class CreateStorageUseCase {
  constructor(
    private readonly storageRepository: StorageRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    createStorageDto: CreateStorageDto,
    user: UserData,
  ): Promise<HttpResponse<Storage>> {
    const newStorage = await this.storageRepository.transaction(async () => {
      // Create storage
      const storage = await this.storageRepository.create({
        productId: createStorageDto.productId,
        name: createStorageDto.name,
        location: createStorageDto.location,
        typeStorageId: createStorageDto.typeStorageId,
        stock: createStorageDto.stock,
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
      statusCode: HttpStatus.CREATED,
      message: 'Almacén creado exitosamente',
      data: newStorage,
    };
  }
}
