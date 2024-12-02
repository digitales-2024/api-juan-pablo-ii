import { AuditService } from '@login/login/admin/audit/audit.service';
import { UserData, HttpResponse } from '@login/login/interfaces';
import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { AuditActionType } from '@prisma/client';
import { CreateServiceTypeDto } from '../dto';
import { ServiceTypeRepository } from '../repositories/service-type.repository';
import { ServiceType } from '../entities/service.entity';

@Injectable()
export class CreateServiceTypeUseCase {
  constructor(
    private readonly serviceTypeRepository: ServiceTypeRepository,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Ejecuta el caso de uso de creación de un nuevo tipo de servicio.
   * @param {CreateServiceTypeDto} createServiceTypeDto - Datos para crear el tipo de servicio.
   * @param {UserData} user - Datos del usuario que crea el tipo de servicio.
   * @returns {Promise<HttpResponse<Service>>} - Respuesta HTTP con el tipo de servicio creado.
   * @throws {BadRequestException} - Si el tipo de servicio existe.
   */
  async execute(
    createServiceTypeDto: CreateServiceTypeDto,
    user: UserData,
  ): Promise<HttpResponse<ServiceType>> {
    // Verificar que el tipo de servicio no existe
    const existingServiceType = await this.serviceTypeRepository.findOne({
      where: {
        name: createServiceTypeDto.name,
      },
    });
    if (existingServiceType) {
      throw new BadRequestException(
        `Tipo de servicio con nombre ${createServiceTypeDto.name} ya existe`,
      );
    }

    // Usar transacción para crear el tipo de servicio y registrar auditoría
    const newServiceType = await this.serviceTypeRepository.transaction(
      async () => {
        const serviceType = await this.serviceTypeRepository.create({
          name: createServiceTypeDto.name,
          description: createServiceTypeDto.description,
          isActive: true,
        });

        // Registrar auditoría
        await this.auditService.create({
          entityId: serviceType.id,
          entityType: 'serviceType',
          action: AuditActionType.CREATE,
          performedById: user.id,
          createdAt: new Date(),
        });

        return serviceType;
      },
    );

    return {
      statusCode: HttpStatus.CREATED,
      message: 'ServiceType created successfully',
      data: newServiceType,
    };
  }
}
