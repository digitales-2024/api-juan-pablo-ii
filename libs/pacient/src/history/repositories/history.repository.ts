import { Injectable } from '@nestjs/common';
import { MedicalHistory, UpdateHistoryData } from '../entities/history.entity';
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
  async findOneWithUpdatesAndImages(
    patientId: string,
  ): Promise<UpdateHistoryData[]> {
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
        const [service, staff, branch /*, images */] = await Promise.all([
          this.findServiceById(update.serviceId),
          this.findStaffById(update.staffId),
          this.findBranchById(update.branchId),
          //this.findImagesByUpdateHistoryId(update.id),
        ]);

        /*  if (images.length > 0) { */
        updates.push({
          id: update.id,
          service: service.name,
          staff: `${staff.name} ${staff.lastName}`,
          branch: branch.name,
          //images,
        });
        /*   } */
      }

      return updates;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  /**
   * Obtiene el nombre completo de un paciente por ID
   * @param patientId - ID del paciente
   * @returns Nombre completo del paciente
   */
  async findPatientFullNameById(patientId: string): Promise<string> {
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
      select: {
        name: true,
        lastName: true,
      },
    });

    if (!patient) {
      throw new Error(`Paciente con ID ${patientId} no encontrado`);
    }

    const { name, lastName } = patient;
    return `${name} ${lastName ?? ''}`.trim();
  }

  /**
   * Actualiza el nombre completo de un paciente en la tabla MedicalHistory
   * @param medicalHistoryId - ID del registro de la historia médica
   * @param patientId - ID del paciente
   * @param fullName - Nuevo nombre completo del paciente
   * @returns true si la actualización fue exitosa, false si no
   */
  async updateMedicalHistoryFullName(
    medicalHistoryId: string,
    patientId: string,
    fullName: string,
    dni: string, // Añadir este parámetro para el DNI
  ): Promise<boolean> {
    try {
      const description = 'Paciente con historia medica asignada';

      const medicalHistory = await this.prisma.medicalHistory.findUnique({
        where: { id: medicalHistoryId },
      });

      if (!medicalHistory || medicalHistory.patientId !== patientId) {
        throw new Error(
          `Registro de historia médica no encontrado o el patientId no coincide`,
        );
      }

      await this.prisma.medicalHistory.update({
        where: { id: medicalHistoryId },
        data: {
          fullName,
          dni, // Agregar el DNI en la actualización
          description: description,
        },
      });

      return true;
    } catch (error) {
      console.error(
        `Error actualizando los datos del paciente en la historia médica con ID ${medicalHistoryId}:`,
        error,
      );
      return false;
    }
  }

  async findPatientFullNameByIdDni(
    patientId: string,
  ): Promise<{ fullName: string; dni: string }> {
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
      select: {
        name: true,
        lastName: true,
        dni: true, // Añadimos el DNI a la selección
      },
    });

    if (!patient) {
      throw new Error(`Paciente con ID ${patientId} no encontrado`);
    }

    const { name, lastName, dni } = patient;
    const fullName = `${name} ${lastName ?? ''}`.trim();

    // Retornamos un objeto con el nombre completo y el DNI
    return {
      fullName,
      dni: dni || '', // Aseguramos que si el DNI es null, retornamos una cadena vacía
    };
  }
}
