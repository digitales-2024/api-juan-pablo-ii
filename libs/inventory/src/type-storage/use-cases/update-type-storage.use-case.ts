import { HttpStatus, Injectable } from '@nestjs/common';
import { UpdateTypeStorageDto } from '../dto/update-type-storage.dto';
import { TypeStorage } from '../entities/type-storage.entity';
import { TypeStorageRepository } from '../repositories/type-storage.repository';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';

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
  ): Promise<HttpResponse<TypeStorage>> {
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
      statusCode: HttpStatus.OK,
      message: 'Tipo de almacenamiento actualizado exitosamente',
      data: updatedTypeStorage,
    };
  }
}
