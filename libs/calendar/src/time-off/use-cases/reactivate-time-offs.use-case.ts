import { Injectable } from '@nestjs/common';
import { TimeOffRepository } from '../repositories/time-off.repository';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { UserData } from '@login/login/interfaces';
import { TimeOff } from '../entities/time-off.entity';
import { AuditActionType } from '@prisma/client';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';
import { DeleteTimeOffsDto } from '../dto/delete-time-offs.dto';

@Injectable()
export class ReactivateTimeOffsUseCase {
  constructor(
    private readonly timeOffRepository: TimeOffRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    reactivateTimeOffsDto: DeleteTimeOffsDto,
    user: UserData,
  ): Promise<BaseApiResponse<TimeOff[]>> {
    const reactivatedTimeOffs = await this.timeOffRepository.transaction(
      async () => {
        const timeOffs = await this.timeOffRepository.reactivateMany(reactivateTimeOffsDto.ids);

        // Registrar auditoría para cada ausencia reactivada
        await Promise.all(
          timeOffs.map((timeOff) =>
            this.auditService.create({
              entityId: timeOff.id,
              entityType: 'time-off',
              action: AuditActionType.UPDATE,
              performedById: user.id,
              createdAt: new Date(),
            }),
          ),
        );

        return timeOffs;
      },
    );

    return {
      success: true,
      message: 'Ausencias temporales reactivadas exitosamente',
      data: reactivatedTimeOffs,
    };
  }
} 