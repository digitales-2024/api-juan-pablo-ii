import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';
import { Specialization } from '../entities/staff.entity';
import { SpecializationRepository } from '../repositories/specialization.repository';
import { CreateSpecializationDto } from '../dto';

@Injectable()
export class CreateSpecializationUseCase {
  constructor(
    private readonly especialidadRepository: SpecializationRepository,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Ejecuta el caso de uso de creación de una nueva especialidad.
   * @param {CreateEspecialidadDto} createSpecializationDto - Datos para crear la especialidad.
   * @param {UserData} user - Datos del usuario que crea la especialidad.
   * @returns {Promise<HttpResponse<Specialization>>} - Respuesta HTTP con la especialidad creada.
   * @throws {BadRequestException} - Si ya existe la especialidad.
   */

  async execute(
    createSpecializationDto: CreateSpecializationDto,
    user: UserData,
  ): Promise<HttpResponse<Specialization>> {
    // Verificar que la especialidad no existe por nombre
    const existingEspecialidad = await this.especialidadRepository.findOne({
      where: {
        name: createSpecializationDto.name,
      },
    });

    if (existingEspecialidad) {
      throw new BadRequestException(
        `Especialidad con nombre ${createSpecializationDto.name} ya existe`,
      );
    }

    // Usar transacción para crear la especialidad y registrar auditoría
    const newEspecialidad = await this.especialidadRepository.transaction(
      async () => {
        const especialidad = await this.especialidadRepository.create({
          name: createSpecializationDto.name,
          description: createSpecializationDto.description,
          isActive: true,
        });

        // Registrar auditoría
        await this.auditService.create({
          entityId: especialidad.id,
          entityType: 'especialidad',
          action: AuditActionType.CREATE,
          performedById: user.id,
          createdAt: new Date(),
        });

        return especialidad;
      },
    );

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Especialidad creada exitosamente',
      data: newEspecialidad,
    };
  }
}
