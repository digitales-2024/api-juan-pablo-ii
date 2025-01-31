import { Injectable } from '@nestjs/common';
import { UpdateOutgoingDto } from '../dto/update-outgoing.dto';
import { Outgoing } from '../entities/outgoing.entity';
import { OutgoingRepository } from '../repositories/outgoing.repository';
import { UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';

@Injectable()
export class UpdateOutgoingUseCase {
  constructor(
    private readonly outgoingRepository: OutgoingRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    id: string,
    updateOutgoingDto: UpdateOutgoingDto,
    user: UserData,
  ): Promise<BaseApiResponse<Outgoing>> {
    const updatedOutgoing = await this.outgoingRepository.transaction(
      async () => {
        // Update outgoing
        const outgoing = await this.outgoingRepository.update(id, {
          name: updateOutgoingDto.name,
          description: updateOutgoingDto.description,
          storageId: updateOutgoingDto.storageId,
          state: updateOutgoingDto.state,
          referenceId: updateOutgoingDto.referenceId,
          date: updateOutgoingDto.date,
        });

        // Register audit
        await this.auditService.create({
          entityId: outgoing.id,
          entityType: 'salida',
          action: AuditActionType.UPDATE,
          performedById: user.id,
          createdAt: new Date(),
        });

        return outgoing;
      },
    );

    return {
      success: true,
      message: 'Salida actualizada exitosamente',
      data: updatedOutgoing,
    };
  }
}
