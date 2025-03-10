import { Injectable } from '@nestjs/common';
import { Staff } from '../entities/staff.entity';
import { BaseRepository, PrismaService } from '@prisma/prisma';

/**
 * Repositorio que extiende BaseRepository para la entidad Personal.
 * Implementa métodos específicos para personal médico.
 *
 * @extends {BaseRepository<Staff>}
 */
@Injectable()
export class StaffRepository extends BaseRepository<Staff> {
  private readonly defaultSelect = {
    select: {
      id: true,
      staffTypeId: true,
      userId: true,
      name: true,
      email: true,
      phone: true,
      lastName: true,
      dni: true,
      birth: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      staffType: {
        select: {
          name: true,
        },
      },
      cmp: true,
      branchId: true,
    },
  };

  constructor(prisma: PrismaService) {
    super(prisma, 'staff');
  }

  async createStaff(data: {
    name: string;
    lastName: string;
    dni: string;
    birth: Date;
    email: string;
    phone?: string;
    staffTypeId: string;
    userId?: string;
    cmp?: string;
    branchId?: string;
  }): Promise<Staff> {
    return this.prisma.measureQuery(`createStaff`, () =>
      this.prisma.staff.create({
        data: {
          name: data.name,
          lastName: data.lastName,
          dni: data.dni,
          birth: data.birth,
          email: data.email,
          phone: data.phone,
          userId: data.userId,
          staffType: {
            connect: {
              id: data.staffTypeId,
            },
          },
          cmp: data.cmp,
          ...(data.branchId ? {
            branch: {
              connect: {
                id: data.branchId
              }
            }
          } : {}),
        },
        select: {
          id: true,
          staffTypeId: true,
          userId: true,
          name: true,
          email: true,
          phone: true,
          lastName: true,
          dni: true,
          birth: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          staffType: {
            select: {
              name: true,
            },
          },
          cmp: true,
          branchId: true,
        },
      }),
    );
  }

  /**
   * Busca personal activo por especialidad
   * @param especialidadId - ID de la especialidad
   * @returns Lista de personal activo de la especialidad especificada
   */
  async findActiveByEspecialidad(staffTypeId: string): Promise<Staff[]> {
    return this.findMany({
      where: {
        staffTypeId,
        isActive: true,
      },
      ...this.defaultSelect,
    });
  }

  /**
   * Busca pacientes por DNI
   * @param dni - DNI a buscar
   * @returns Array de personal que coinciden con el DNI
   */
  async findStaffByDNI(dni: string): Promise<Staff[]> {
    return this.findByField('dni', dni);
  }

  // Renombrar método para consistencia
  async findByStaffType(staffTypeId: string) {
    return this.findMany({
      where: {
        staffTypeId,
        isActive: true,
      },
      ...this.defaultSelect,
    });
  }

  async findMany(params?: any): Promise<Staff[]> {
    return this.prisma.staff.findMany({
      ...params,
      ...this.defaultSelect,
    });
  }

  async findById(id: string): Promise<Staff> {
    return this.prisma.staff.findUnique({
      where: { id },
      ...this.defaultSelect,
    });
  }

  async findByField(field: string, value: any): Promise<Staff[]> {
    return this.prisma.staff.findMany({
      where: { [field]: value },
      ...this.defaultSelect,
    });
  }
}
