import { Injectable } from '@nestjs/common';
import { MedicalHistory } from '../entities/history.entity';
import { BaseRepository, PrismaService } from '@prisma/prisma';

@Injectable()
export class MedicalHistoryRepository extends BaseRepository<MedicalHistory> {
  constructor(prisma: PrismaService) {
    super(prisma, 'medicalHistory'); // Tabla del esquema de prisma
  }

  /**
   * Valida si existe un registro en una tabla específica por ID
   * @param table - Nombre de la tabla donde buscar
   * @param id - ID a buscar
   * @returns true si existe el registro, false si no
   */
  async findByIdValidate(table: string, id: string): Promise<boolean> {
    const result = await this.prisma.measureQuery(`findBy${table}Id`, () =>
      (this.prisma[table] as any).findUnique({
        where: { id },
      }),
    );

    return !!result;
  }

  /**
   * Obtiene los datos del servicio por ID
   */
  private async findServiceById(serviceId: string): Promise<{ name: string }> {
    const service = await this.prisma.service.findUnique({
      where: { id: serviceId },
      select: { name: true },
    });
    return service;
  }

  /**
   * Obtiene los datos del staff por ID
   */
  private async findStaffById(
    staffId: string,
  ): Promise<{ name: string; lastName: string }> {
    const staff = await this.prisma.staff.findUnique({
      where: { id: staffId },
      select: {
        name: true,
        lastName: true,
      },
    });
    return staff;
  }

  /**
   * Obtiene los datos de la sucursal por ID
   */
  private async findBranchById(branchId: string): Promise<{ name: string }> {
    const branch = await this.prisma.branch.findUnique({
      where: { id: branchId },
      select: { name: true },
    });
    return branch;
  }

  /**
   * Obtiene todas las imágenes asociadas a un UpdateHistory
   */
  private async findImagesByUpdateHistoryId(
    updateHistoryId: string,
  ): Promise<Array<{ id: string; url: string }>> {
    const images = await this.prisma.imagePatient.findMany({
      where: {
        updateHistoryId,
        isActive: true,
      },
      select: {
        id: true,
        imageUrl: true,
      },
    });

    return images.map((img) => ({
      id: img.id,
      url: img.imageUrl,
    }));
  }

  /**
   * Obtiene todas las actualizaciones (UpdateHistory) de un paciente
   */
  private async findUpdateHistoriesByPatientId(
    patientId: string,
  ): Promise<any[]> {
    return this.prisma.updateHistory.findMany({
      where: {
        patientId,
        isActive: true,
      },
      select: {
        id: true,
        serviceId: true,
        staffId: true,
        branchId: true,
      },
    });
  }

  /**
   * Obtiene las actualizaciones e imágenes para una historia médica
   */
  async findOneWithUpdatesAndImages(patientId: string): Promise<
    Array<{
      id: string;
      service: string;
      staff: string;
      branch: string;
      images: Array<{ id: string; url: string }>;
    }>
  > {
    try {
      // 1. Obtenemos todas las actualizaciones del paciente
      const updateHistories = await this.prisma.updateHistory.findMany({
        where: {
          patientId,
          isActive: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          serviceId: true,
          staffId: true,
          branchId: true,
        },
      });

      const updates = [];

      for (const update of updateHistories) {
        const [service, staff, branch, images] = await Promise.all([
          this.findServiceById(update.serviceId),
          this.findStaffById(update.staffId),
          this.findBranchById(update.branchId),
          this.findImagesByUpdateHistoryId(update.id),
        ]);

        if (images.length > 0) {
          updates.push({
            id: update.id,
            service: service.name,
            staff: `${staff.name} ${staff.lastName}`,
            branch: branch.name,
            images,
          });
        }
      }

      return updates;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
