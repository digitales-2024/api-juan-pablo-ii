import {
  BadRequestException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ServiceTypeRepository } from '../repositories/service-type.repository';
import { CreateServiceTypeDto, UpdateServiceTypeDto } from '../dto';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { ServiceType } from '../entities/service.entity';
import { AuditActionType } from '@prisma/client';
import { handleException } from '@login/login/utils';

/**
 * Servicio que implementa la lógica de negocio para tipos de servicios médicos.
 * Utiliza ServiceTypeRepository para acceder a la base de datos.
 *
 * @class
 */
@Injectable()
export class ServiceTypeService {
  private readonly logger = new Logger(ServiceTypeService.name);
  constructor(
    private readonly serviceTypeRepository: ServiceTypeRepository,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Crea un nuevo tipo de servicio.
   * @param {CreateServiceTypeDto} createServiceTypeDto - Datos para crear el tipo de servicio.
   * @param {UserData} user - Datos del usuario que crea el tipo de servicio.
   * @returns {Promise<HttpResponse<ServiceType>>} - Respuesta HTTP con el tipo de servicio creado.
   * @throws {BadRequestException} - Si el tipo de servicio ya existe.
   * @throws {Error} - Si ocurre un error al crear el tipo de servicio.
   */
  async create(
    createServiceTypeDto: CreateServiceTypeDto,
    user: UserData,
  ): Promise<HttpResponse<ServiceType>> {
    try {
      // Verificar que el tipo de servicio no existe
      const existingServiceType = await this.serviceTypeRepository.findOne({
        where: {
          name: createServiceTypeDto.name,
        },
      });
      if (existingServiceType) {
        throw new BadRequestException(
          `ServiceType with name '${createServiceTypeDto.name}' already exists`,
        );
      }

      // Usar transacción para crear el tipo de servicio y registrar auditoría
      const newServiceType = await this.serviceTypeRepository.transaction(
        async () => {
          const serviceType = await this.serviceTypeRepository.create({
            name: createServiceTypeDto.name,
            description: createServiceTypeDto.description,
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
    } catch (error) {
      if (error instanceof BadRequestException) {
        this.logger.warn(`Error creating ServiceType: ${error.message}`);
        throw error;
      } else {
        this.logger.error(
          `Error creating ServiceType: ${error.message}`,
          error.stack,
        );
        handleException(error, 'Error creating ServiceType');
      }
    }
  }

  async findAll() {
    return this.serviceTypeRepository.findMany();
  }
  async findById(id: string): Promise<ServiceType> {
    const serviceType = await this.serviceTypeRepository.findById(id);
    if (!serviceType) {
      throw new BadRequestException(`Tipo de servicio no encontrado`);
    }
    return serviceType;
  }

  async update(id: string, updateServiceTypeDto: UpdateServiceTypeDto) {
    return this.serviceTypeRepository.update(id, updateServiceTypeDto);
  }

  async remove(id: string) {
    return this.serviceTypeRepository.softDelete(id);
  }
}
