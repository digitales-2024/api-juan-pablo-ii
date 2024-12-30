import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateConsultationDto } from '../dto/create-consultation.dto';
import { Consultation } from '../entities/consultation.entity';
import { ConsultationRepository } from '../repositories/consultation.repository';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';

@Injectable()
export class CreateConsultationUseCase {
  constructor(
    private readonly consultationRepository: ConsultationRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    createConsultationDto: CreateConsultationDto,
    user: UserData,
  ): Promise<HttpResponse<Consultation>> {
    const newConsultation = await this.consultationRepository.transaction(
      async () => {
        // Create consultation
        const consultation = await this.consultationRepository.create({
          serviceId: createConsultationDto.serviceId,
          pacienteId: createConsultationDto.pacienteId,
          sucursalId: createConsultationDto.sucursalId,
          description: createConsultationDto.descripcion,
          date: new Date(createConsultationDto.date),
        });

        // Register audit
        await this.auditService.create({
          entityId: consultation.id,
          entityType: 'consultaMedica',
          action: AuditActionType.CREATE,
          performedById: user.id,
          createdAt: new Date(),
        });

        return consultation;
      },
    );

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Consulta creada exitosamente',
      data: newConsultation,
    };
  }
}
