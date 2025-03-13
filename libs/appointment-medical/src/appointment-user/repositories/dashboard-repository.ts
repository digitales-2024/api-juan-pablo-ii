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

  // Añadir este método a la clase DashboardRepository existente

  /**
   * Obtiene los 12 servicios más demandados con conteo por sucursal
   * @returns Array con datos de los servicios más utilizados por sucursal
   */
  async getTopServicesBySucursal(): Promise<any[]> {
    this.logger.log('Iniciando consulta de top servicios por sucursal');

    // Obtener todas las citas confirmadas y completadas
    const citas = await this.prisma.appointment.findMany({
      where: {
        status: {
          in: ['CONFIRMED', 'COMPLETED'],
        },
      },
      select: {
        serviceId: true,
        branch: {
          select: {
            name: true,
          },
        },
        service: {
          select: {
            name: true,
          },
        },
        start: true,
      },
      orderBy: {
        start: 'desc',
      },
    });

    this.logger.log(`Total de citas encontradas: ${citas.length}`);

    if (citas.length === 0) {
      return [];
    }

    // Agrupar por servicioId para contar ocurrencias totales
    const serviciosCount: Record<
      string,
      {
        JLBYR: number;
        Yanahuara: number;
        serviceName: string;
        total: number;
      }
    > = {};

    // Contar citas por servicio y sucursal
    citas.forEach((cita) => {
      const serviceId = cita.serviceId;
      const serviceName = cita.service.name;

      if (!serviciosCount[serviceId]) {
        serviciosCount[serviceId] = {
          JLBYR: 0,
          Yanahuara: 0,
          serviceName,
          total: 0,
        };
      }

      if (cita.branch?.name === 'JLBYR') {
        serviciosCount[serviceId].JLBYR += 1;
      } else if (cita.branch?.name === 'Yanahuara') {
        serviciosCount[serviceId].Yanahuara += 1;
      }

      // Incrementar contador total
      serviciosCount[serviceId].total += 1;
    });

    // Convertir a array y ordenar por total (descendente)
    const serviciosArray = Object.values(serviciosCount).sort(
      (a, b) => b.total - a.total,
    );

    // Tomar solo los 12 más demandados
    const top12Servicios = serviciosArray.slice(0, 12);

    // Mapear al formato requerido por el frontend
    const resultado = top12Servicios.map((servicio) => ({
      serviceName: servicio.serviceName,
      JLBYR: servicio.JLBYR,
      Yanahuara: servicio.Yanahuara,
    }));

    this.logger.log(`Retornando ${resultado.length} servicios más demandados`);
    return resultado;
  }

  // Añadir este método a la clase DashboardRepository existente

  /**
   * Obtiene las cotizaciones pagadas vs pendientes de los últimos 12 meses
   * @returns Array con datos de cotizaciones por mes y sucursal
   */
  async getCotizacionesPorEstado(): Promise<any[]> {
    this.logger.log('Iniciando consulta de cotizaciones por estado y sucursal');

    // Primero obtenemos la orden más reciente para determinar el último mes con registros
    const ultimaOrden = await this.prisma.order.findFirst({
      where: {
        status: {
          in: ['COMPLETED', 'PENDING'],
        },
        isActive: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        createdAt: true,
      },
    });

    // Si no hay órdenes, devolvemos array vacío
    if (!ultimaOrden) {
      this.logger.warn('No se encontraron órdenes');
      return [];
    }

    // Usamos la fecha de la última orden como referencia
    const fechaReferencia = new Date(ultimaOrden.createdAt);
    this.logger.log(`Fecha de referencia: ${fechaReferencia.toISOString()}`);

    // Calculamos la fecha de hace 12 meses desde la última orden
    const startDate = new Date(fechaReferencia);
    startDate.setMonth(fechaReferencia.getMonth() - 11); // 11 meses atrás + el mes actual = 12 meses
    startDate.setDate(1); // Primer día del mes
    startDate.setHours(0, 0, 0, 0); // Comienzo del día
    this.logger.log(`Fecha de inicio: ${startDate.toISOString()}`);

    // Obtener todas las órdenes completadas y pendientes en los últimos 12 meses
    const ordenes = await this.prisma.order.findMany({
      where: {
        status: {
          in: ['COMPLETED', 'PENDING'],
        },
        isActive: true,
        createdAt: {
          gte: startDate,
          lte: fechaReferencia,
        },
      },
      select: {
        status: true,
        metadata: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    this.logger.log(`Total de órdenes encontradas: ${ordenes.length}`);

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

    // Inicializar contador por mes y estado
    const contadorPorMes: Record<
      string,
      { pendientes: number; pagadas: number; etiqueta: string }
    > = {};

    // Inicializamos todos los meses con cero
    ultimos12Meses.forEach((mesData) => {
      // Creamos una etiqueta personalizada con formato "Mes YYYY"
      const etiqueta = `${mesData.nombre} ${mesData.año}`;
      contadorPorMes[etiqueta] = {
        pendientes: 0,
        pagadas: 0,
        etiqueta,
      };
    });

    // Contar órdenes por mes y estado
    ordenes.forEach((orden) => {
      const fechaOrden = new Date(orden.createdAt);
      const mesOrden = fechaOrden.getMonth();
      const añoOrden = fechaOrden.getFullYear();

      // Encontrar la etiqueta correspondiente a esta fecha
      const mesMatch = ultimos12Meses.find(
        (m) => m.mes === mesOrden && m.año === añoOrden,
      );

      if (mesMatch) {
        const etiqueta = `${mesMatch.nombre} ${mesMatch.año}`;

        // Extraer el branchId de metadata si está disponible
        let branchInfo = '';
        if (orden.metadata) {
          try {
            // Si metadata es una cadena JSON, intentamos parsearla
            let metadataObj;
            if (typeof orden.metadata === 'string') {
              // Eliminar caracteres escapados si los hay
              const cleanMetadata = orden.metadata.replace(/\\/g, '');
              // Intentar extraer JSON válido (puede estar entre comillas)
              const match = cleanMetadata.match(/\{.*\}/);
              if (match) {
                metadataObj = JSON.parse(match[0]);
              }
            } else {
              // Ya es un objeto
              metadataObj = orden.metadata;
            }

            // Intentar extraer el branchId de diferentes estructuras posibles
            if (
              metadataObj &&
              metadataObj.orderDetails &&
              metadataObj.orderDetails.branchId
            ) {
              branchInfo = metadataObj.orderDetails.branchId;
              console.log(
                '🚀 ~ DashboardRepository ~ ordenes.forEach ~ branchInfo:',
                branchInfo,
              );
            }
          } catch (error) {
            this.logger.warn(`Error al parsear metadata: ${error.message}`);
          }
        }

        // Contar según el estado
        if (orden.status === 'PENDING') {
          contadorPorMes[etiqueta].pendientes += 1;
        } else if (orden.status === 'COMPLETED') {
          contadorPorMes[etiqueta].pagadas += 1;
        }
      }
    });

    // Convertir a array con el formato requerido por el front
    const resultado = Object.values(contadorPorMes).map((counts) => ({
      month: counts.etiqueta.split(' ')[0], // Solo mostramos el nombre del mes sin el año
      pendientes: counts.pendientes,
      pagadas: counts.pagadas,
    }));

    this.logger.log(`Retornando ${resultado.length} registros`);
    return resultado;
  }

  // Añadir este método a la clase DashboardRepository existente

  /**
   * Obtiene los ingresos diarios por sucursal de los últimos 3 meses
   * @returns Array con datos de ingresos diarios por sucursal
   */
  async getIngresosPorSucursal(): Promise<any[]> {
    this.logger.log('Iniciando consulta de ingresos por sucursal');

    // Calculamos la fecha de hace 3 meses desde hoy
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    threeMonthsAgo.setHours(0, 0, 0, 0);

    this.logger.log(`Fecha de inicio: ${threeMonthsAgo.toISOString()}`);

    // Obtener todas las órdenes completadas en los últimos 3 meses
    const ordenes = await this.prisma.order.findMany({
      where: {
        status: 'COMPLETED',
        isActive: true,
        createdAt: {
          gte: threeMonthsAgo,
        },
      },
      select: {
        total: true,
        metadata: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    this.logger.log(`Total de órdenes encontradas: ${ordenes.length}`);

    // Mapa para almacenar las sucursales y sus IDs
    const sucursalesMap = new Map<string, string>();

    // Primero, extraer todos los branchIds únicos
    const branchIds = new Set<string>();

    ordenes.forEach((orden) => {
      if (orden.metadata) {
        try {
          // Si metadata es una cadena JSON, intentamos parsearla
          let metadataObj;
          if (typeof orden.metadata === 'string') {
            // Eliminar caracteres escapados si los hay
            const cleanMetadata = orden.metadata.replace(/\\/g, '');
            // Intentar extraer JSON válido (puede estar entre comillas)
            const match = cleanMetadata.match(/\{.*\}/);
            if (match) {
              metadataObj = JSON.parse(match[0]);
            }
          } else {
            // Ya es un objeto
            metadataObj = orden.metadata;
          }

          // Extraer el branchId
          if (
            metadataObj &&
            metadataObj.orderDetails &&
            metadataObj.orderDetails.branchId
          ) {
            branchIds.add(metadataObj.orderDetails.branchId);
          }
        } catch (error) {
          this.logger.warn(`Error al parsear metadata: ${error.message}`);
        }
      }
    });

    // Buscar nombres de sucursales para los IDs encontrados
    if (branchIds.size > 0) {
      const branches = await this.prisma.branch.findMany({
        where: {
          id: {
            in: Array.from(branchIds),
          },
        },
        select: {
          id: true,
          name: true,
        },
      });

      // Crear mapa de ID a nombre de sucursal
      branches.forEach((branch) => {
        sucursalesMap.set(branch.id, branch.name);
      });
    }

    // Mapa para almacenar los ingresos por día y sucursal
    const ingresosPorDia: Record<string, Record<string, number>> = {};

    // Procesar las órdenes para obtener ingresos por día y sucursal
    ordenes.forEach((orden) => {
      if (!orden.metadata) return;

      try {
        // Extraer metadata
        let metadataObj;
        if (typeof orden.metadata === 'string') {
          const cleanMetadata = orden.metadata.replace(/\\/g, '');
          const match = cleanMetadata.match(/\{.*\}/);
          if (match) {
            metadataObj = JSON.parse(match[0]);
          }
        } else {
          metadataObj = orden.metadata;
        }

        // Verificar si podemos obtener el branchId y total
        if (
          metadataObj &&
          metadataObj.orderDetails &&
          metadataObj.orderDetails.branchId &&
          metadataObj.orderDetails.transactionDetails &&
          typeof metadataObj.orderDetails.transactionDetails.total === 'number'
        ) {
          const branchId = metadataObj.orderDetails.branchId;
          const branchName = sucursalesMap.get(branchId) || branchId; // Usar nombre si existe, o ID como fallback
          const montoTotal =
            metadataObj.orderDetails.transactionDetails.total || orden.total;
          const fechaOrden = new Date(orden.createdAt);
          const fechaKey = fechaOrden.toISOString().split('T')[0]; // Formato YYYY-MM-DD

          // Inicializar registro para la fecha si no existe
          if (!ingresosPorDia[fechaKey]) {
            ingresosPorDia[fechaKey] = {};
          }

          // Acumular el monto para la sucursal y fecha
          if (!ingresosPorDia[fechaKey][branchName]) {
            ingresosPorDia[fechaKey][branchName] = 0;
          }
          ingresosPorDia[fechaKey][branchName] += montoTotal;
        }
      } catch (error) {
        this.logger.warn(`Error al procesar orden: ${error.message}`);
      }
    });

    // Convertir a formato esperado por el frontend
    const resultado: any[] = [];

    Object.entries(ingresosPorDia).forEach(([fecha, montosPorSucursal]) => {
      const registro: any = { date: fecha };

      // Agregar monto para cada sucursal
      Object.entries(montosPorSucursal).forEach(([sucursal, monto]) => {
        registro[sucursal] = Math.round(monto); // Redondear para simplificar
      });

      resultado.push(registro);
    });

    // Ordenar por fecha
    resultado.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    this.logger.log(`Retornando datos para ${resultado.length} días`);
    return resultado;
  }

  // Añadir estos métodos a la clase DashboardRepository existente

  /**
   * Obtiene el total de ingresos del mes actual basado en el último registro
   * @returns Total de ingresos del mes
   */
  async getTotalIngresosMes(): Promise<number> {
    this.logger.log('Iniciando consulta de total de ingresos del mes actual');

    // Encontrar la orden completada más reciente para determinar el "mes actual" de referencia
    const ultimaOrden = await this.prisma.order.findFirst({
      where: {
        status: 'COMPLETED',
        isActive: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        createdAt: true,
      },
    });

    if (!ultimaOrden) {
      this.logger.warn('No se encontraron órdenes completadas');
      return 0;
    }

    // Usar la fecha de la última orden como referencia
    const fechaReferencia = new Date(ultimaOrden.createdAt);

    // Calcular primer día del mes de la orden más reciente
    const primerDiaMes = new Date(fechaReferencia);
    primerDiaMes.setDate(1);
    primerDiaMes.setHours(0, 0, 0, 0);

    // Calcular último día del mes de la orden más reciente
    const ultimoDiaMes = new Date(primerDiaMes);
    ultimoDiaMes.setMonth(ultimoDiaMes.getMonth() + 1);
    ultimoDiaMes.setDate(0); // Último día del mes
    ultimoDiaMes.setHours(23, 59, 59, 999);

    this.logger.log(
      `Período para el mes actual: ${primerDiaMes.toISOString()} - ${ultimoDiaMes.toISOString()}`,
    );

    // Obtener todas las órdenes completadas de este mes
    const ordenes = await this.prisma.order.findMany({
      where: {
        status: 'COMPLETED',
        isActive: true,
        createdAt: {
          gte: primerDiaMes,
          lte: ultimoDiaMes,
        },
      },
      select: {
        total: true,
        metadata: true,
      },
    });

    this.logger.log(`Total de órdenes encontradas: ${ordenes.length}`);

    // Sumar los valores de total
    let totalIngresos = 0;

    ordenes.forEach((orden) => {
      try {
        if (orden.metadata) {
          // Si metadata es una cadena JSON, intentamos parsearla
          let metadataObj;
          if (typeof orden.metadata === 'string') {
            try {
              // Limpiar la cadena (eliminar escapes y comillas extras)
              const cleanMetadata = orden.metadata
                .replace(/\\"/g, '"')
                .replace(/\\/g, '');

              // Intentar extraer un objeto JSON válido usando expresión regular
              const match = cleanMetadata.match(/\{.*\}/s);
              if (match) {
                metadataObj = JSON.parse(match[0]);
              }
            } catch (parseError) {
              this.logger.warn(
                `Error al parsear metadata como cadena: ${parseError.message}`,
              );
            }
          } else {
            // Ya es un objeto
            metadataObj = orden.metadata;
          }

          // Intentar obtener el total de transactionDetails
          if (
            metadataObj &&
            metadataObj.orderDetails &&
            metadataObj.orderDetails.transactionDetails &&
            typeof metadataObj.orderDetails.transactionDetails.total ===
              'number'
          ) {
            totalIngresos += metadataObj.orderDetails.transactionDetails.total;
            this.logger.debug(
              `Sumando desde metadata: ${metadataObj.orderDetails.transactionDetails.total}`,
            );
          } else {
            // Si no está en metadata, usar el total de la orden
            totalIngresos += orden.total;
            this.logger.debug(`Sumando desde orden.total: ${orden.total}`);
          }
        } else {
          // Si no hay metadata, usar el total de la orden
          totalIngresos += orden.total;
          this.logger.debug(`No hay metadata, sumando: ${orden.total}`);
        }
      } catch (error) {
        this.logger.warn(
          `Error procesando orden: ${error.message}, usando total: ${orden.total}`,
        );
        totalIngresos += orden.total;
      }
    });

    this.logger.log(`Total de ingresos calculado: ${totalIngresos}`);
    return totalIngresos;
  }

  /**
   * Obtiene el ingreso promedio por día del mes actual
   * @returns Ingreso promedio por día
   */
  async getIngresoPromedioDiario(): Promise<number> {
    this.logger.log('Iniciando consulta de ingreso promedio diario');

    // Encontrar la orden completada más reciente para determinar el "mes actual" de referencia
    const ultimaOrden = await this.prisma.order.findFirst({
      where: {
        status: 'COMPLETED',
        isActive: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        createdAt: true,
      },
    });

    if (!ultimaOrden) {
      this.logger.warn('No se encontraron órdenes completadas');
      return 0;
    }

    // Usar la fecha de la última orden como referencia
    const fechaReferencia = new Date(ultimaOrden.createdAt);

    // Calcular primer día del mes de la orden más reciente
    const primerDiaMes = new Date(fechaReferencia);
    primerDiaMes.setDate(1);
    primerDiaMes.setHours(0, 0, 0, 0);

    // En lugar de contar todos los días del mes, contamos los días transcurridos hasta la fecha de referencia
    const diasTranscurridos = fechaReferencia.getDate();

    this.logger.log(`Días transcurridos en el mes: ${diasTranscurridos}`);

    // Obtener el total de ingresos usando la función corregida
    const totalIngresos = await this.getTotalIngresosMes();

    // Calcular el promedio diario solo para los días transcurridos
    const promedioDiario = totalIngresos / diasTranscurridos;

    this.logger.log(`Ingreso promedio diario calculado: ${promedioDiario}`);
    return promedioDiario;
  }

  /**
   * Obtiene el total de pacientes registrados
   * @returns Número total de pacientes
   */
  async getTotalPacientes(): Promise<number> {
    this.logger.log('Iniciando consulta de total de pacientes');

    const totalPacientes = await this.prisma.patient.count({
      where: {
        isActive: true,
      },
    });

    this.logger.log(`Total de pacientes encontrados: ${totalPacientes}`);
    return totalPacientes;
  }

  /**
   * Obtiene el número de citas completadas en el mes actual
   * @returns Número de citas completadas
   */
  async getCitasCompletadas(): Promise<number> {
    this.logger.log('Iniciando consulta de citas completadas del mes actual');

    // Encontrar la cita completada más reciente para determinar el "mes actual" de referencia
    const ultimaCita = await this.prisma.appointment.findFirst({
      where: {
        status: 'COMPLETED',
      },
      orderBy: {
        start: 'desc',
      },
      select: {
        start: true,
      },
    });

    // Si no hay citas completadas, devolver 0
    if (!ultimaCita) {
      this.logger.warn('No se encontraron citas completadas');
      return 0;
    }

    // Usar la fecha de la última cita como referencia
    const fechaReferencia = new Date(ultimaCita.start);

    // Calcular primer día del mes de la cita más reciente
    const primerDiaMes = new Date(fechaReferencia);
    primerDiaMes.setDate(1);
    primerDiaMes.setHours(0, 0, 0, 0);

    // Calcular último día del mes de la cita más reciente
    const ultimoDiaMes = new Date(primerDiaMes);
    ultimoDiaMes.setMonth(ultimoDiaMes.getMonth() + 1);
    ultimoDiaMes.setDate(0); // Último día del mes
    ultimoDiaMes.setHours(23, 59, 59, 999);

    this.logger.log(
      `Período para citas completadas: ${primerDiaMes.toISOString()} - ${ultimoDiaMes.toISOString()}`,
    );

    // Contar citas completadas en el período
    const citasCompletadas = await this.prisma.appointment.count({
      where: {
        status: 'COMPLETED',
        start: {
          gte: primerDiaMes,
          lte: ultimoDiaMes,
        },
      },
    });

    this.logger.log(
      `Total de citas completadas encontradas: ${citasCompletadas}`,
    );
    return citasCompletadas;
  }

  /**
   * Obtiene el número de citas pendientes (confirmadas) actuales y futuras
   * @returns Número de citas pendientes
   */
  async getCitasPendientes(): Promise<number> {
    this.logger.log(
      'Iniciando consulta de citas pendientes actuales y futuras',
    );

    // Usar la fecha y hora actual como punto de referencia
    const ahora = new Date();

    this.logger.log(
      `Consultando citas pendientes desde: ${ahora.toISOString()}`,
    );

    // Contar citas confirmadas que están programadas desde ahora en adelante
    const citasPendientes = await this.prisma.appointment.count({
      where: {
        status: 'CONFIRMED',
        start: {
          gte: ahora,
        },
      },
    });

    this.logger.log(
      `Total de citas pendientes encontradas: ${citasPendientes}`,
    );
    return citasPendientes;
  }

  /**
   * Obtiene todos los datos de los KPI Cards
   * @returns Objeto con todos los datos para los KPI Cards
   */
  async getKpiCardsData(): Promise<any> {
    this.logger.log('Iniciando consulta de datos para KPI Cards');

    // Obtener todos los datos en paralelo para mejor rendimiento
    const [
      totalIngresos,
      ingresoPromedio,
      totalPacientes,
      citasCompletadas,
      citasPendientes,
    ] = await Promise.all([
      this.getTotalIngresosMes(),
      this.getIngresoPromedioDiario(),
      this.getTotalPacientes(),
      this.getCitasCompletadas(),
      this.getCitasPendientes(),
    ]);

    return {
      totalIngresos,
      ingresoPromedio,
      totalPacientes,
      citasCompletadas,
      citasPendientes,
    };
  }
}
