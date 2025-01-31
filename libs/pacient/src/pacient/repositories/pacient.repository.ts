import { Injectable } from '@nestjs/common';
import { Patient } from '../entities/pacient.entity';
import { BaseRepository, PrismaService } from '@prisma/prisma';

@Injectable()
export class PacientRepository extends BaseRepository<Patient> {
  constructor(prisma: PrismaService) {
    super(prisma, 'patient'); // Tabla del esquema de prisma
  }
  /**
   * Busca pacientes por DNI
   * @param dni - DNI a buscar
   * @returns Array de pacientes que coinciden con el DNI
   */
  async findPatientByDNI(dni: string): Promise<Patient[]> {
    return this.findByField('dni', dni);
  }
}
