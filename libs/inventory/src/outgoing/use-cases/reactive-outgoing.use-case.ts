import { Injectable } from '@nestjs/common';
import { OutgoingRepository } from '../repositories/outgoing.repository';
import { DetailedOutgoing } from '../entities/outgoing.entity';
import { UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';

@Injectable()
export class ReactivateOutgoingUseCase {
  constructor(
    private readonly outgoingRepository: OutgoingRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    ids: string[],
    user: UserData,
  ): Promise<BaseApiResponse<DetailedOutgoing[]>> {
    // Reactivar las salidas y registrar auditoría
    const reactivatedOutgoings = await this.outgoingRepository.transaction(
      async () => {
        const outgoings = await this.outgoingRepository.reactivateMany(ids);

        // Registrar auditoría para cada salida reactivada
        await Promise.all(
          outgoings.map((outgoing) =>
            this.auditService.create({
              entityId: outgoing.id,
              entityType: 'salida',
              action: AuditActionType.UPDATE,
              performedById: user.id,
              createdAt: new Date(),
            }),
          ),
        );

        return await this.outgoingRepository.getAllDetailedOutgoing();
      },
    );

    return {
      success: true,
      message: 'Salidas reactivadas exitosamente',
      data: reactivatedOutgoings,
    };
  }
}
