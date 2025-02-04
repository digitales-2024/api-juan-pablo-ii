import { Injectable } from '@nestjs/common';
import { CreateStaffScheduleDto } from '../dto/create-staff-schedule.dto';
import { StaffSchedule } from '../entities/staff-schedule.entity';
import { StaffScheduleRepository } from '../repositories/staff-schedule.repository';
import { UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';

@Injectable()
export class CreateStaffScheduleUseCase {
  constructor(
    private readonly staffScheduleRepository: StaffScheduleRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    createStaffScheduleDto: CreateStaffScheduleDto,
    user: UserData,
  ): Promise<BaseApiResponse<StaffSchedule>> {
    const newSchedule = await this.staffScheduleRepository.transaction(async () => {
      // Create staff schedule
      const schedule = await this.staffScheduleRepository.create({
        ...createStaffScheduleDto,
        isActive: true,
        exceptions: createStaffScheduleDto.exceptions || [],
      });

      // Register audit
      await this.auditService.create({
        entityId: schedule.id,
        entityType: 'staff_schedule',
        action: AuditActionType.CREATE,
        performedById: user.id,
        createdAt: new Date(),
      });

      return schedule;
    });

    return {
      success: true,
      message: 'Horario del personal creado exitosamente',
      data: newSchedule,
    };
  }
}
