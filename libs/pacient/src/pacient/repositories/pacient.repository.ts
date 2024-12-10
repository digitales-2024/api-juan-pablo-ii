import { Injectable } from '@nestjs/common';
import { BaseRepository, PrismaService } from '@prisma/prisma';
import { Paciente } from '../entities/pacient.entity';

@Injectable()
export class PacientRepository extends BaseRepository<Paciente> {
  constructor(prisma: PrismaService) {
    super(prisma, 'paciente'); // Tabla del esquema de prisma
  }
  /**
   * Busca pacientes por DNI
   * @param dni - DNI a buscar
   * @returns Array de pacientes que coinciden con el DNI
   */
  async findPatientByDNI(dni: string): Promise<Paciente[]> {
    return this.findByField('dni', dni);
  }
}
