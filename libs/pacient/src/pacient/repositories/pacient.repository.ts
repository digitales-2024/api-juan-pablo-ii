import { Injectable, Logger } from '@nestjs/common';
import { Patient, PatientPrescriptions } from '../entities/pacient.entity';
import { BaseRepository, PrismaService } from '@prisma/prisma';
import {
  Prescription,
  PrescriptionItemResponse,
} from '@pacient/pacient/recipe/entities/recipe.entity';
import { plainToInstance } from 'class-transformer';

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

  async findPatientPrescriptions(
    limit: number = 10,
    offset: number = 0,
  ): Promise<PatientPrescriptions[]> {
    const patients = await this.prisma.patient.findMany({
      take: limit,
      skip: offset,
      select: {
        id: true,
        name: true,
        lastName: true,
        dni: true,
        birthDate: true,
        gender: true,
        address: true,
        phone: true,
        email: true,
        isActive: true,
        Prescription: true,
      },
    });

    // Transformar los resultados al tipo correcto
    return patients.map((patient) => {
      // Procesar cada prescripción
      const transformedPrescriptions = patient.Prescription.map(
        (prescription) => {
          // Convertir los JSON a arrays tipados
          const medicaments = this.parseJsonToType<PrescriptionItemResponse[]>(
            prescription.prescriptionMedicaments,
            [],
          );

          const services = this.parseJsonToType<PrescriptionItemResponse[]>(
            prescription.prescriptionServices,
            [],
          );

          // Crear una instancia de Prescription con los datos transformados
          return plainToInstance(Prescription, {
            ...prescription,
            prescriptionMedicaments: medicaments.map((med) =>
              plainToInstance(PrescriptionItemResponse, med),
            ),
            prescriptionServices: services.map((svc) =>
              plainToInstance(PrescriptionItemResponse, svc),
            ),
          });
        },
      );

      // Retornar el paciente con prescripciones transformadas
      return plainToInstance(PatientPrescriptions, {
        ...patient,
        Prescription: transformedPrescriptions,
      });
    });
  }

  async findPrescriptionsByPatientDNI(
    dni: string,
  ): Promise<PatientPrescriptions> {
    const patient = await this.prisma.patient.findUniqueOrThrow({
      where: {
        dni: dni,
      },
      select: {
        id: true,
        name: true,
        lastName: true,
        dni: true,
        birthDate: true,
        gender: true,
        address: true,
        phone: true,
        email: true,
        isActive: true,
        Prescription: true,
      },
    });

    const transformedPrescriptions = patient.Prescription.map(
      (prescription) => {
        // Convertir los JSON a arrays tipados
        const medicaments = this.parseJsonToType<PrescriptionItemResponse[]>(
          prescription.prescriptionMedicaments,
          [],
        );

        const services = this.parseJsonToType<PrescriptionItemResponse[]>(
          prescription.prescriptionServices,
          [],
        );

        // Crear una instancia de Prescription con los datos transformados
        return plainToInstance(Prescription, {
          ...prescription,
          prescriptionMedicaments: medicaments.map((med) =>
            plainToInstance(PrescriptionItemResponse, med),
          ),
          prescriptionServices: services.map((svc) =>
            plainToInstance(PrescriptionItemResponse, svc),
          ),
        });
      },
    );
    return plainToInstance(PatientPrescriptions, {
      ...patient,
      Prescription: transformedPrescriptions,
    });
  }

  // Función auxiliar para parsear JSON a tipos específicos
  private parseJsonToType<T>(jsonValue: any, defaultValue: T): T {
    if (!jsonValue) return defaultValue;
    try {
      if (typeof jsonValue === 'string') {
        return JSON.parse(jsonValue);
      }
      return jsonValue as T;
    } catch (error) {
      Logger.error('Error parsing JSON:', error);
      return defaultValue;
    }
  }
}
