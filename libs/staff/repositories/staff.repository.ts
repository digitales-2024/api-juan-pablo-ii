import { Injectable } from '@nestjs/common';
import { BaseRepository, PrismaService } from '@prisma/prisma';
import { Staff } from '../entities/staff.entity';

/**
 * Repositorio que extiende BaseRepository para la entidad Personal.
 * Implementa métodos específicos para personal médico.
 *
 * @extends {BaseRepository<Staff>}
 */
@Injectable()
export class StaffRepository extends BaseRepository<Staff> {
  constructor(prisma: PrismaService) {
    super(prisma, 'personal');
  }

  async createPersonal(data: {
    name: string;
    lastName: string;
    dni: string;
    birth: string;
    email: string;
    phone?: string;
    especialidadId: string;
    userId?: string;
  }): Promise<Staff> {
    return this.prisma.measureQuery(`createPersonal`, () =>
      this.prisma.personal.create({
        data: {
          name: data.name,
          lastName: data.lastName,
          dni: data.dni,
          birth: data.birth,
          email: data.email,
          phone: data.phone,
          userId: data.userId,
          especialidad: {
            connect: {
              id: data.especialidadId,
            },
          },
        },
        include: {
          especialidad: true,
        },
      }),
    );
  }
  /**
   * Busca personal activo por especialidad
   * @param especialidadId - ID de la especialidad
   * @returns Lista de personal activo de la especialidad especificada
   */
  async findActiveByEspecialidad(especialidadId: string): Promise<Staff[]> {
    return this.findMany({
      where: {
        especialidadId,
        isActive: true,
      },
      include: {
        especialidad: true,
      },
    });
  }
}
