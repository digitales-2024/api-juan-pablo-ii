import { HttpStatus, Injectable } from '@nestjs/common';
import { AppointmentTypeRepository } from '../repositories/appointment-type.repository';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { AppointmentType } from '../entities/appointment-type.entity';
import { AuditActionType } from '@prisma/client';
import { DeleteAppointmentTypesDto } from '../dto/delete-appointment-types.dto';

@Injectable()
export class DeleteAppointmentTypesUseCase {
  constructor(
    private readonly appointmentTypeRepository: AppointmentTypeRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    deleteAppointmentTypesDto: DeleteAppointmentTypesDto,
    user: UserData,
  ): Promise<HttpResponse<AppointmentType[]>> {
    const deactivatedTypes = await this.appointmentTypeRepository.transaction(
      async () => {
        const types = await this.appointmentTypeRepository.deleteMany(
          deleteAppointmentTypesDto.ids,
        );

        await Promise.all(
          types.map((type) =>
            this.auditService.create({
              entityId: type.id,
              entityType: 'appointmentType',
              action: AuditActionType.DELETE,
              performedById: user.id,
              createdAt: new Date(),
            }),
          ),
        );

        return types;
      },
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Tipos de cita eliminado exitosamente',
      data: deactivatedTypes,
    };
  }
}
