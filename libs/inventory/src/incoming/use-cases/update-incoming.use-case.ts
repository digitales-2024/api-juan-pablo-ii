import { Injectable } from '@nestjs/common';
import { UpdateIncomingDto } from '../dto/update-incoming.dto';
import { DetailedIncoming } from '../entities/incoming.entity';
import { IncomingRepository } from '../repositories/incoming.repository';
import { UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';
//import { UpdateMovementDto } from '@inventory/inventory/movement/dto';

@Injectable()
export class UpdateIncomingUseCase {
  constructor(
    private readonly incomingRepository: IncomingRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    id: string,
    updateIncomingDto: UpdateIncomingDto,
    user: UserData,
  ): Promise<BaseApiResponse<DetailedIncoming>> {
    const updatedIncoming = await this.incomingRepository.transaction(
      async () => {
        // Update incoming
        const incoming = await this.incomingRepository.update(id, {
          name: updateIncomingDto.name,
          description: updateIncomingDto.description,
          storageId: updateIncomingDto.storageId,
          outgoingId: updateIncomingDto?.outgoingId,
          state: updateIncomingDto.state,
          referenceId: updateIncomingDto.referenceId,
          date: updateIncomingDto.date,
        });

        // Register audit
        await this.auditService.create({
          entityId: incoming.id,
          entityType: 'ingreso',
          action: AuditActionType.UPDATE,
          performedById: user.id,
          createdAt: new Date(),
        });

        return await this.incomingRepository.findDetailedIncomingById(
          incoming.id,
        );
      },
    );

    return {
      success: true,
      message: 'Ingreso actualizado exitosamente',
      data: updatedIncoming,
    };
  }
}
