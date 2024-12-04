import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { AppointmentTypeRepository } from '../repositories/appointment-type.repository';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { AppointmentType } from '../entities/appointment-type.entity';
import { CreateAppointmentTypeDto } from '../dto';
import { AuditActionType } from '@prisma/client';

@Injectable()
export class CreateAppointmentTypeUseCase {
  constructor(
    private readonly appointmentTypeRepository: AppointmentTypeRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    createAppointmentTypeDto: CreateAppointmentTypeDto,
    user: UserData,
  ): Promise<HttpResponse<AppointmentType>> {
    const existingType = await this.appointmentTypeRepository.findOne({
      where: { name: createAppointmentTypeDto.name },
    });

    if (existingType) {
      throw new BadRequestException(
        `Tipo de cita con nombre ${createAppointmentTypeDto.name} ya existe`,
      );
    }

    const newType = await this.appointmentTypeRepository.transaction(
      async () => {
        const appointmentType = await this.appointmentTypeRepository.create({
          name: createAppointmentTypeDto.name,
          description: createAppointmentTypeDto.description,
        });

        await this.auditService.create({
          entityId: appointmentType.id,
          entityType: 'appointmentType',
          action: AuditActionType.CREATE,
          performedById: user.id,
          createdAt: new Date(),
        });

        return appointmentType;
      },
    );

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Tipo de cita creado exitosamente',
      data: newType,
    };
  }
}
