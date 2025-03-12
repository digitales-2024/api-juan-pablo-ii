import { Injectable, Logger } from '@nestjs/common';
import { BaseRepository, PrismaService } from '@prisma/prisma';
import { AppointmentMedicalResponse } from '../entities/apponitment-user..entity';

@Injectable()
export class DashboardRepository extends BaseRepository<AppointmentMedicalResponse> {
  private readonly logger = new Logger(DashboardRepository.name);

  constructor(prisma: PrismaService) {
    super(prisma, 'appointment'); // Tabla del esquema de prisma
  }

  /**
   * Obtiene las citas confirmadas y completadas por sucursal de los últimos 12 meses
   * @returns Array con datos de citas por mes y sucursal
   */
  async getAppointmentsBySucursal(): Promise<any[]> {
    this.logger.log(
      'Iniciando consulta de citas por sucursal por fecha de cita',
    );

    // Primero obtenemos la cita más reciente para determinar el último mes con registros
    // Ahora usando el campo "start" en lugar de "createdAt"
    const ultimaCita = await this.prisma.appointment.findFirst({
      where: {
        status: {
          in: ['CONFIRMED', 'COMPLETED'],
        },
      },
      orderBy: {
        start: 'desc', // Cambiado de "createdAt" a "start"
      },
      select: {
        start: true, // Cambiado de "createdAt" a "start"
      },
    });

    // Si no hay citas, devolvemos array vacío
    if (!ultimaCita) {
      this.logger.warn('No se encontraron citas');
      return [];
    }

    // Usamos la fecha de la última cita como referencia
    const fechaReferencia = new Date(ultimaCita.start); // Cambiado de "createdAt" a "start"
    this.logger.log(`Fecha de referencia: ${fechaReferencia.toISOString()}`);

    // Calculamos la fecha de hace 12 meses desde la última cita
    const startDate = new Date(fechaReferencia);
    startDate.setMonth(fechaReferencia.getMonth() - 11); // 11 meses atrás + el mes actual = 12 meses
    startDate.setDate(1); // Primer día del mes
    startDate.setHours(0, 0, 0, 0); // Comienzo del día
    this.logger.log(`Fecha de inicio: ${startDate.toISOString()}`);

    // Obtener todas las citas confirmadas y completadas en los últimos 12 meses
    // Ahora usando el campo "start" en lugar de "createdAt"
    const citas = await this.prisma.appointment.findMany({
      where: {
        status: {
          in: ['CONFIRMED', 'COMPLETED'],
        },
        start: {
          // Cambiado de "createdAt" a "start"
          gte: startDate,
          lte: fechaReferencia,
        },
      },
      select: {
        start: true, // Cambiado de "createdAt" a "start"
        branch: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        start: 'asc', // Cambiado de "createdAt" a "start"
      },
    });

    this.logger.log(`Total de citas encontradas: ${citas.length}`);

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
        etiqueta,
      };
    });

    // Contar citas por mes y sucursal
    // Ahora usando el campo "start" en lugar de "createdAt"
    citas.forEach((cita) => {
      const fechaCita = new Date(cita.start); // Cambiado de "createdAt" a "start"
      const mesCita = fechaCita.getMonth();
      const añoCita = fechaCita.getFullYear();

      // Encontrar la etiqueta correspondiente a esta fecha
      const mesMatch = ultimos12Meses.find(
        (m) => m.mes === mesCita && m.año === añoCita,
      );

      if (mesMatch) {
        const etiqueta = `${mesMatch.nombre} ${mesMatch.año}`;

        if (cita.branch?.name === 'JLBYR') {
          contadorPorMes[etiqueta].JLBYR += 1;
        } else if (cita.branch?.name === 'Yanahuara') {
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

    this.logger.log(`Retornando ${resultado.length} registros`);
    return resultado;
  }
}
