import { Injectable } from '@nestjs/common';
import { BaseRepository, PrismaService } from '@prisma/prisma';
import { Service } from '../entities/service.entity';

/**
 * Repositorio que extiende BaseRepository para la entidad Service.
 * Implementa métodos específicos para servicios médicos.
 *
 * @extends {BaseRepository<Service>}
 */

@Injectable()
export class ServiceRepository extends BaseRepository<Service> {
  constructor(prisma: PrismaService) {
    super(prisma, 'service');
  }
  /**
   * Busca servicios activos por tipo de servicio
   * @param serviceTypeId - ID del tipo de servicio
   * @returns Lista de servicios activos del tipo especificado
   */
  async findActiveByType(serviceTypeId: string): Promise<Service[]> {
    return this.findMany({
      where: {
        serviceTypeId,
        isActive: true,
      },
      include: {
        serviceType: true,
      },
    });
  }
}
