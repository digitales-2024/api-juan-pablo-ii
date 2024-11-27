import {
  BadRequestException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ServiceRepository } from '../repositories/service.repository';
import { CreateServiceDto, UpdateServiceDto } from '../dto';
import { ServiceTypeService } from './service-type.service';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { Service } from '../entities/service.entity';
import { AuditActionType } from '@prisma/client';
import { handleException } from '@login/login/utils';

/**
 * Servicio que implementa la lógica de negocio para servicios médicos.
 * Utiliza ServiceRepository para acceder a la base de datos.
 *
 * @class
 */
@Injectable()
export class ServiceService {
  private readonly logger = new Logger(ServiceService.name);
  constructor(
    private readonly serviceRepository: ServiceRepository,
    private readonly serviceTypeService: ServiceTypeService,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Crea un nuevo servicio.
   * @param {CreateServiceDto} createServiceDto - Datos para crear el servicio.
   * @param {UserData} user - Datos del usuario que crea el servicio.
   * @returns {Promise<HttpResponse<Service>>} - Respuesta HTTP con el servicio creado.
   * @throws {BadRequestException} - Si el tipo de servicio no existe.
   * @throws {Error} - Si ocurre un error al crear el servicio.
   */
  async create(
    createServiceDto: CreateServiceDto,
    user: UserData,
  ): Promise<HttpResponse<Service>> {
    try {
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
        statusCode: HttpStatus.CREATED,
        message: 'Service created successfully',
        data: newService,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        this.logger.warn(`Error creating Service: ${error.message}`);
        throw error;
      } else {
        this.logger.error(
          `Error creating Service: ${error.message}`,
          error.stack,
        );
        handleException(error, 'Error creating Service');
      }
    }
  }

  async findAll() {
    return this.serviceRepository.findMany({
      where: {
        isActive: true,
      },
      include: {
        serviceType: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findById(id: string) {
    const service = await this.serviceRepository.findById(id, {
      serviceType: true,
    });

    if (!service) {
      throw new NotFoundException(`Service with id ${id} not found`);
    }

    return service;
  }

  async update(id: string, updateServiceDto: UpdateServiceDto) {
    if (updateServiceDto.serviceTypeId) {
      await this.serviceTypeService.findById(updateServiceDto.serviceTypeId);
    }

    return this.serviceRepository.update(id, updateServiceDto);
  }

  async remove(id: string) {
    return this.serviceRepository.softDelete(id);
  }
}
