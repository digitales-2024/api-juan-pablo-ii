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
    return this.prisma.patient.findMany({
      where: {
        dni: {
          contains: dni,
          mode: 'insensitive',
        },
      },
      take: 10,
    });
  }

  /**
   * Busca pacientes por DNI parcial optimizado para búsqueda en tiempo real
   * @param partialDni - DNI parcial (mínimo 5 dígitos)
   * @param limit - Límite de resultados (máximo 10)
   * @returns Array de pacientes que coinciden con el DNI parcial
   */
  async searchByPartialDni(
    partialDni: string,
    limit: number = 10,
  ): Promise<Patient[]> {
    return this.prisma.patient.findMany({
      where: {
        dni: {
          startsWith: partialDni,
        },
        isActive: true, // Solo pacientes activos
      },
      take: limit,
      orderBy: {
        dni: 'asc', // Ordenar por DNI para resultados consistentes
      },
    });
  }

  async findFirstPatients(limit: number = 10): Promise<Patient[]> {
    return this.prisma.patient.findMany({
      take: limit,
    });
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

  //funcion prisma para traer la data de los pacientes registrados por las sucursales para el Kpi
  /**
   * Obtiene los pacientes registrados por sucursal de los últimos 12 meses desde el último registro
   * @returns Array con datos de pacientes por mes y sucursal
   */
  async getPacientesPorSucursal(): Promise<any[]> {
    // Primero obtenemos el paciente más reciente para determinar el último mes con registros
    const ultimoPaciente = await this.prisma.patient.findFirst({
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        createdAt: true,
      },
    });

    // Si no hay pacientes, devolvemos array vacío
    if (!ultimoPaciente) {
      return [];
    }

    // Usamos la fecha del último paciente como referencia
    const fechaReferencia = new Date(ultimoPaciente.createdAt);

    // Calculamos la fecha de hace 12 meses desde el último registro
    const startDate = new Date(fechaReferencia);
    startDate.setMonth(fechaReferencia.getMonth() - 11); // 11 meses atrás + el mes actual = 12 meses
    startDate.setDate(1); // Primer día del mes
    startDate.setHours(0, 0, 0, 0); // Comienzo del día

    // Obtener todos los pacientes activos creados en los últimos 12 meses desde el último registro
    const pacientes = await this.prisma.patient.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: fechaReferencia,
        },
      },
      select: {
        createdAt: true,
        sucursal: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Crear un arreglo para almacenar los últimos 12 meses con sus nombres en español
    const ultimos12Meses: { nombre: string; mes: number; año: number }[] = [];

    // Llenar el arreglo con los nombres de los meses en español
    for (let i = 0; i < 12; i++) {
      const fecha = new Date(fechaReferencia);
      fecha.setMonth(fechaReferencia.getMonth() - i);

      const mesIndex = fecha.getMonth();
      const nombreMes = [
        'Enero',
        'Febrero',
        'Marzo',
        'Abril',
        'Mayo',
        'Junio',
        'Julio',
        'Agosto',
        'Septiembre',
        'Octubre',
        'Noviembre',
        'Diciembre',
      ][mesIndex];

      ultimos12Meses.push({
        nombre: nombreMes,
        mes: mesIndex,
        año: fecha.getFullYear(),
      });
    }

    // Invertimos para que quede de más antiguo a más reciente
    ultimos12Meses.reverse();

    // Inicializar contador por mes
    const contadorPorMes: Record<
      string,
      { JLBYR: number; Yanahuara: number; etiqueta: string }
    > = {};

    // Inicializamos todos los meses con cero
    ultimos12Meses.forEach((mesData) => {
      // Creamos una etiqueta personalizada con formato "Mes YYYY"
      const etiqueta = `${mesData.nombre} ${mesData.año}`;
      contadorPorMes[etiqueta] = {
        JLBYR: 0,
        Yanahuara: 0,
        etiqueta, // Guardamos la etiqueta para ordenar después
      };
    });

    // Contar pacientes por mes y sucursal
    pacientes.forEach((paciente) => {
      const fechaPaciente = new Date(paciente.createdAt);
      const mesPaciente = fechaPaciente.getMonth();
      const añoPaciente = fechaPaciente.getFullYear();

      // Encontrar la etiqueta correspondiente a esta fecha
      const mesMatch = ultimos12Meses.find(
        (m) => m.mes === mesPaciente && m.año === añoPaciente,
      );

      if (mesMatch) {
        const etiqueta = `${mesMatch.nombre} ${mesMatch.año}`;

        if (paciente.sucursal === 'JLBYR') {
          contadorPorMes[etiqueta].JLBYR += 1;
        } else if (paciente.sucursal === 'Yanahuara') {
          contadorPorMes[etiqueta].Yanahuara += 1;
        }
      }
    });

    // Convertir a array con el formato requerido por el front
    const resultado = Object.entries(contadorPorMes).map(([month, counts]) => ({
      month: month.split(' ')[0], // Solo mostramos el nombre del mes sin el año
      JLBYR: counts.JLBYR,
      Yanahuara: counts.Yanahuara,
    }));

    return resultado;
  }
}
