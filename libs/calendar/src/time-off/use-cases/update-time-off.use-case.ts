import { Injectable } from '@nestjs/common';
import { UpdateTimeOffDto } from '../dto/update-time-off.dto';
import { TimeOff } from '../entities/time-off.entity';
import { AuditActionType } from '@prisma/client';
import { TimeOffRepository } from '../repositories/time-off.repository';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { UserData } from '@login/login/interfaces';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';

@Injectable()
export class UpdateTimeOffUseCase {
  constructor(
    private readonly timeOffRepository: TimeOffRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    id: string,
    updateTimeOffDto: UpdateTimeOffDto,
    user: UserData,
  ): Promise<BaseApiResponse<TimeOff>> {
    const updatedTimeOff = await this.timeOffRepository.transaction(async () => {
      // Update time off
      const timeOff = await this.timeOffRepository.update(id, {
        start: updateTimeOffDto.start,
        end: updateTimeOffDto.end,
        reason: updateTimeOffDto.reason,
        staffId: updateTimeOffDto.staffId,
        branchId: updateTimeOffDto.branchId,
      });

      // Register audit
      await this.auditService.create({
        entityId: timeOff.id,
        entityType: 'time-off',
        action: AuditActionType.UPDATE,
        performedById: user.id,
        createdAt: new Date(),
      });

      return timeOff;
    });

    return {
      success: true,
      message: 'Ausencia temporal actualizada exitosamente',
      data: updatedTimeOff,
    };
  }
} 