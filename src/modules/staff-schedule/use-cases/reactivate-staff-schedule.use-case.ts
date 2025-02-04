import { Injectable } from '@nestjs/common';
import { StaffScheduleRepository } from '../repositories/staff-schedule.repository';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { UserData } from '@login/login/interfaces';
import { StaffSchedule } from '../entities/staff-schedule.entity';
import { AuditActionType } from '@prisma/client';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';

@Injectable()
export class ReactivateStaffSchedulesUseCase {
  constructor(
    private readonly staffScheduleRepository: StaffScheduleRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    ids: string[],
    user: UserData,
  ): Promise<BaseApiResponse<StaffSchedule[]>> {
    const reactivatedSchedules = await this.staffScheduleRepository.transaction(
      async () => {
        const schedules = await this.staffScheduleRepository.reactivateMany(ids);

        await Promise.all(
          schedules.map((schedule) =>
            this.auditService.create({
              entityId: schedule.id,
              entityType: 'staff_schedule',
              action: AuditActionType.UPDATE,
              performedById: user.id,
              createdAt: new Date(),
            })
          ),
        );

        return schedules;
      },
    );

    return {
      success: true,
      message: 'Horarios reactivados exitosamente',
      data: reactivatedSchedules,
    };
  }
} 