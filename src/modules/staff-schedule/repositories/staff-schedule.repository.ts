import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { StaffSchedule } from '../entities/staff-schedule.entity';
import { BaseRepository, PrismaService } from '@prisma/prisma';

@Injectable()
export class StaffScheduleRepository extends BaseRepository<StaffSchedule> {
  private readonly logger = new Logger(StaffScheduleRepository.name);

  constructor(prisma: PrismaService) {
    // Asegúrate de que el string coincida con el nombre del modelo en schema.prisma
    super(prisma, 'staffSchedule');
  }

  /**
   * Busca un Horario del personal por su ID (método interno)
   * @param id - ID del horario a buscar
   * @returns El horario encontrado o lanza un error en caso de no existir
   * @throws {BadRequestException} Si el horario no se encuentra
   * @internal
   */
  async findStaffScheduleById(id: string): Promise<StaffSchedule> {
    const schedule = await this.findById(id);
    if (!schedule) {
      throw new BadRequestException('Horario del personal no encontrado');
    }
    return schedule;
  }

  async findWithRelations(params?: any): Promise<StaffSchedule[]> {
    this.logger.warn(`[DEBUG] Consulta Prisma: ${JSON.stringify(params)}`);

    try {
      const results = await this.findMany({
        ...params,
        include: {
          staff: {
            select: {
              name: true,
              lastName: true
            }
          },
          branch: {
            select: {
              name: true
            }
          }
        }
      });

      this.logger.debug(`Resultados encontrados: ${results.length}`);
      return results;

    } catch (error) {
      this.logger.error(`Error en findWithRelations: ${error.message}`, error.stack);
      throw error;
    }
  }
}
