import { BadRequestException, Injectable } from '@nestjs/common';
import { UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';
import { StaffTypeRepository } from '../repositories/staff-type.repository';
import { UpdateStaffTypeDto } from '../dto';
import { StaffType } from '../entities/staff.entity';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';

/**
 * Caso de uso para actualizar tipos de personal
 * @class
 * @description Maneja la lógica de negocio para actualizar tipos de personal, incluyendo validaciones y registro de auditoría
 */
@Injectable()
export class UpdateStaffTypeUseCase {
  constructor(
    private readonly staffTypeRepository: StaffTypeRepository,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Ejecuta la actualización de un tipo de personal
   * @param id - ID del tipo de personal a actualizar
   * @param UpdateStaffTypeDto - DTO con los datos a actualizar
   * @param user - Datos del usuario que realiza la operación
   * @returns Respuesta con el tipo de personal actualizado
   * @throws {BadRequestException} Si ya existe un tipo de personal con el mismo nombre
   */
  async execute(
    id: string,
    UpdateStaffTypeDto: UpdateStaffTypeDto,
    user: UserData,
  ): Promise<BaseApiResponse<StaffType>> {
    // Si se está actualizando el nombre, verificar que no exista otra especialidad con ese nombre
    if (UpdateStaffTypeDto.name) {
      const existingStaffType = await this.staffTypeRepository.findOne({
        where: {
          name: UpdateStaffTypeDto.name,
          NOT: {
            id: id,
          },
        },
      });

      if (existingStaffType) {
        throw new BadRequestException(
          `Ya existe un tipo de personal con el nombre ${UpdateStaffTypeDto.name}`,
        );
      }
    }

    // Realizar la actualización dentro de una transacción
    const updatedStaffType = await this.staffTypeRepository.transaction(
      async () => {
        const staffType = await this.staffTypeRepository.update(id, {
          name: UpdateStaffTypeDto.name,
          description: UpdateStaffTypeDto.description,
        });

        // Registrar auditoría
        await this.auditService.create({
          entityId: staffType.id,
          entityType: 'staffType',
          action: AuditActionType.UPDATE,
          performedById: user.id,
          createdAt: new Date(),
        });

        return staffType;
      },
    );

    return {
      success: true,
      message: 'Tipo de personal actualizado exitosamente',
      data: updatedStaffType,
    };
  }
}
