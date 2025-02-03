import { Injectable } from '@nestjs/common';
import { IncomingRepository } from '../repositories/incoming.repository';
import { Incoming } from '../entities/incoming.entity';
import { UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';

@Injectable()
export class ReactivateIncomingUseCase {
  constructor(
    private readonly incomingRepository: IncomingRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    ids: string[],
    user: UserData,
  ): Promise<BaseApiResponse<Incoming[]>> {
    // Reactivar los ingresos y registrar auditoría
    const reactivatedIncomings = await this.incomingRepository.transaction(
      async () => {
        const incomings = await this.incomingRepository.reactivateMany(ids);

        // Registrar auditoría para cada ingreso reactivado
        await Promise.all(
          incomings.map((incoming) =>
            this.auditService.create({
              entityId: incoming.id,
              entityType: 'ingreso',
              action: AuditActionType.UPDATE,
              performedById: user.id,
              createdAt: new Date(),
            }),
          ),
        );

        return incomings;
      },
    );

    return {
      success: true,
      message: 'Ingresos reactivados exitosamente',
      data: reactivatedIncomings,
    };
  }
}
