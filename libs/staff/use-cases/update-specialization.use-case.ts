import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';
import { Specialization } from '../entities/staff.entity';
import { SpecializationRepository } from '../repositories/specialization.repository';
import { UpdateSpecializationDto } from '../dto';

@Injectable()
export class UpdateSpecializationUseCase {
  constructor(
    private readonly especialidadRepository: SpecializationRepository,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Ejecuta el caso de uso de actualización de una especialidad existente.
   * @param {string} id - ID de la especialidad a actualizar.
   * @param {UpdateEspecialidadDto} updateSpecializationDto - Datos para actualizar la especialidad.
   * @param {UserData} user - Datos del usuario que realiza la actualización.
   * @returns {Promise<HttpResponse<Especialidad>>} - Respuesta HTTP con la especialidad actualizada.
   * @throws {BadRequestException} - Si ya existe una especialidad con el nuevo nombre.
   */
  async execute(
    id: string,
    updateSpecializationDto: UpdateSpecializationDto,
    user: UserData,
  ): Promise<HttpResponse<Specialization>> {
    // Si se está actualizando el nombre, verificar que no exista otra especialidad con ese nombre
    if (updateSpecializationDto.name) {
      const existingEspecialidad = await this.especialidadRepository.findOne({
        where: {
          name: updateSpecializationDto.name,
          NOT: {
            id: id,
          },
        },
      });

      if (existingEspecialidad) {
        throw new BadRequestException(
          `Ya existe una especialidad con el nombre ${updateSpecializationDto.name}`,
        );
      }
    }

    // Realizar la actualización dentro de una transacción
    const updatedEspecialidad = await this.especialidadRepository.transaction(
      async () => {
        const especialidad = await this.especialidadRepository.update(id, {
          name: updateSpecializationDto.name,
          description: updateSpecializationDto.description,
        });

        // Registrar auditoría
        await this.auditService.create({
          entityId: especialidad.id,
          entityType: 'especialidad',
          action: AuditActionType.UPDATE,
          performedById: user.id,
          createdAt: new Date(),
        });

        return especialidad;
      },
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Especialidad actualizada exitosamente',
      data: updatedEspecialidad,
    };
  }
}
