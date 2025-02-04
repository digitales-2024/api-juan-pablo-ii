import { Injectable } from '@nestjs/common';
import { TimeOffRepository } from '../repositories/time-off.repository';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { UserData } from '@login/login/interfaces';
import { TimeOff } from '../entities/time-off.entity';
import { AuditActionType } from '@prisma/client';
import { DeleteTimeOffsDto } from '../dto/delete-time-offs.dto';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';

@Injectable()
export class DeleteTimeOffsUseCase {
  constructor(
    private readonly timeOffRepository: TimeOffRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    deleteTimeOffsDto: DeleteTimeOffsDto,
    user: UserData,
  ): Promise<BaseApiResponse<TimeOff[]>> {
    const deletedTimeOffs = await this.timeOffRepository.transaction(
      async () => {
        // Realiza el soft delete y obtiene las ausencias actualizadas
        const timeOffs = await this.timeOffRepository.softDeleteMany(
          deleteTimeOffsDto.ids,
        );

        // Registra la auditoría para cada ausencia eliminada
        await Promise.all(
          timeOffs.map((timeOff) =>
            this.auditService.create({
              entityId: timeOff.id,
              entityType: 'time-off',
              action: AuditActionType.DELETE,
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
      message: 'Ausencias temporales desactivadas exitosamente',
      data: deletedTimeOffs,
    };
  }
} 