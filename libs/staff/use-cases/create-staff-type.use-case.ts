import { BadRequestException, Injectable } from '@nestjs/common';
import { UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';
import { StaffTypeRepository } from '../repositories/staff-type.repository';
import { CreateStaffTypeDto } from '../dto';
import { StaffType } from '../entities/staff.entity';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';

/**
 * Caso de uso para crear nuevo tipo de personal
 * @class
 * @description Maneja la lógica de negocio para crear tipos de personal, incluyendo validaciones y registro de auditoría
 */
@Injectable()
export class CreateStaffTypeUseCase {
  constructor(
    private readonly staffTypeRepository: StaffTypeRepository,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Ejecuta la creación de un tipo de personal
   * @param CreateStaffTypeDto - DTO con los datos del tipo de personal a crear
   * @param user - Datos del usuario que realiza la operación
   * @returns Respuesta con el tipo de personal creado
   * @throws {BadRequestException} Si ya existe un tipo de personal con el mismo nombre
   */
  async execute(
    CreateStaffTypeDto: CreateStaffTypeDto,
    user: UserData,
  ): Promise<BaseApiResponse<StaffType>> {
    // Verificar que la especialidad no existe por nombre
      const existingStaffType = await this.staffTypeRepository.findOne({
      where: {
        name: CreateStaffTypeDto.name,
      },
    });

    if (existingStaffType) {
      throw new BadRequestException(
        `Tipo de personal con nombre ${CreateStaffTypeDto.name} ya existe`,
      );
    }

    // Usar transacción para crear la especialidad y registrar auditoría
      const newStaffType = await this.staffTypeRepository.transaction(
      async () => {
          const staffType = await this.staffTypeRepository.create({
          name: CreateStaffTypeDto.name,
          description: CreateStaffTypeDto.description,
          isActive: true,
        });

        // Registrar auditoría
        await this.auditService.create({
          entityId: staffType.id,
          entityType: 'staffType',
          action: AuditActionType.CREATE,
          performedById: user.id,
          createdAt: new Date(),
        });

          return staffType;
      },
    );

    return {
      success: true,
      message: 'Tipo de personal creado exitosamente',
      data: newStaffType,
    };
  }
}
