import { Injectable } from '@nestjs/common';
import { UpdateAppointmentUserDto } from '../dto/update-apponitment-user.dto';
import { AppointmentMedicalResponse } from '../entities/apponitment-user..entity';
import { ApponitmentUserRepository } from '../repositories/apponitment-user.repository';
import { UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';

@Injectable()
export class UpdateApponitmentUserUseCase {
  constructor(
    private readonly apponitmentUserRepository: ApponitmentUserRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    id: string,
    updateAppointmentUserDto: UpdateAppointmentUserDto,
    user: UserData,
  ): Promise<BaseApiResponse<AppointmentMedicalResponse>> {
    const updatedPrescription =
      await this.apponitmentUserRepository.transaction(async () => {
        // Update prescription
        const prescription = await this.apponitmentUserRepository.update(id, {
          status: updateAppointmentUserDto.status,
        });

        // Register audit
        await this.auditService.create({
          entityId: prescription.id,
          entityType: 'prescription',
          action: AuditActionType.UPDATE,
          performedById: user.id,
          createdAt: new Date(),
        });

        return prescription;
      });

    return {
      success: true,
      message: 'Receta médica actualizada exitosamente',
      data: updatedPrescription,
    };
  }
}
