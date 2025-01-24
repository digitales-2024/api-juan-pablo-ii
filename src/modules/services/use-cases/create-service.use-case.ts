import { Injectable } from '@nestjs/common';
import { CreateServiceDto } from '../dto/create-service.dto';
import { Service } from '../entities/service.entity';
import { ServiceRepository } from '../repositories/service.repository';
import { UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';
import { ServiceTypeService } from '../services/service-type.service';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';

@Injectable()
export class CreateServiceUseCase {
  constructor(
    private readonly serviceRepository: ServiceRepository,
    private readonly serviceTypeService: ServiceTypeService,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Ejecuta el caso de uso de creación de un nuevo servicio.
   * @param {CreateServiceDto} createServiceDto - Datos para crear el servicio.
   * @param {UserData} user - Datos del usuario que crea el servicio.
   * @returns {Promise<HttpResponse<Service>>} - Respuesta HTTP con el servicio creado.
   * @throws {BadRequestException} - Si el tipo de servicio no existe.
   */
  async execute(
    createServiceDto: CreateServiceDto,
    user: UserData,
  ): Promise<BaseApiResponse<Service>> {
    // Verificar que existe el tipo de servicio
    await this.serviceTypeService.findById(createServiceDto.serviceTypeId);

    // Usar transacción para crear el servicio y registrar auditoría
    const newService = await this.serviceRepository.transaction(async () => {
      const service = await this.serviceRepository.create({
        name: createServiceDto.name,
        description: createServiceDto.description,
        price: createServiceDto.price,
        serviceTypeId: createServiceDto.serviceTypeId,
        isActive: true,
      });

      // Registrar auditoría
      await this.auditService.create({
        entityId: service.id,
        entityType: 'service',
        action: AuditActionType.CREATE,
        performedById: user.id,
        createdAt: new Date(),
      });

      return service;
    });

    return {
      success: true,
      message: 'Servicio creado exitosamente',
      data: newService,
    };
  }
}
