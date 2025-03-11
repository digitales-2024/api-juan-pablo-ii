import { Injectable } from '@nestjs/common';
import { AppointmentResponse } from '../entities/apponitment-user..entity';
import { ApponitmentUserRepository } from '../repositories/apponitment-user.repository';
import { UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';
import { UpdateAppointmentUserDto } from '../dto/update-apponitment-user.dto';

@Injectable()
export class UpdateApponitmentUserUseCase {
  constructor(
    private readonly apponitmentUserRepository: ApponitmentUserRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    id: string,
    updateDto: UpdateAppointmentUserDto,
    user: UserData,
  ): Promise<BaseApiResponse<AppointmentResponse>> {
    const updatedAppointment = await this.apponitmentUserRepository.transaction(
      async () => {
        // Usamos la función específica para actualizar estado de citas
        const appointment =
          await this.apponitmentUserRepository.updateAppointmentStatus(
            id,
            updateDto.status as 'COMPLETED' | 'NO_SHOW',
          );

        // Registramos la auditoría
        await this.auditService.create({
          entityId: appointment.id,
          entityType: 'appointment',
          action: AuditActionType.UPDATE,
          performedById: user.id,
          createdAt: new Date(),
        });

        return appointment;
      },
    );

    return {
      success: true,
      message: 'Estado de cita actualizado exitosamente',
      data: updatedAppointment,
    };
  }
}
