import { HttpStatus, Injectable } from '@nestjs/common';
import { AppointmentTypeRepository } from '../repositories/appointment-type.repository';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { AppointmentType } from '../entities/appointment-type.entity';
import { UpdateAppointmentTypeDto } from '../dto';
import { AuditActionType } from '@prisma/client';

@Injectable()
export class UpdateAppointmentTypeUseCase {
  constructor(
    private readonly appointmentTypeRepository: AppointmentTypeRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    id: string,
    updateAppointmentTypeDto: UpdateAppointmentTypeDto,
    user: UserData,
  ): Promise<HttpResponse<AppointmentType>> {
    const updatedType = await this.appointmentTypeRepository.transaction(
      async () => {
        const appointmentType = await this.appointmentTypeRepository.update(
          id,
          {
            name: updateAppointmentTypeDto.name,
            description: updateAppointmentTypeDto.description,
          },
        );

        await this.auditService.create({
          entityId: appointmentType.id,
          entityType: 'appointmentType',
          action: AuditActionType.UPDATE,
          performedById: user.id,
          createdAt: new Date(),
        });

        return appointmentType;
      },
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Tipo de cita actualizado exitosamente',
      data: updatedType,
    };
  }
}
