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
}
