import { BadRequestException, Injectable } from '@nestjs/common';
import { StaffSchedule } from '../entities/staff-schedule.entity';
import { BaseRepository, PrismaService } from '@prisma/prisma';

@Injectable()
export class StaffScheduleRepository extends BaseRepository<StaffSchedule> {
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
}
