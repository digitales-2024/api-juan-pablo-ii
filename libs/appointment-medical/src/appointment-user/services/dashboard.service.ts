import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { DashboardRepository } from '../repositories/dashboard-repository';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(private readonly dashboardRepository: DashboardRepository) {}

  /**
   * Obtiene datos de citas por sucursal para el dashboard KPI
   * @returns Datos de citas agrupados por mes y sucursal
   */
  async getCitasPorSucursal() {
    try {
      /*   this.logger.log('Iniciando consulta de citas por sucursal'); // Log inicial */

      const citasData =
        await this.dashboardRepository.getAppointmentsBySucursal();

      /*       this.logger.log(
        `Datos obtenidos del repositorio: ${JSON.stringify(citasData)}`,
      ); // Log después del repository */

      const response = {
        statusCode: HttpStatus.OK,
        message: 'Datos de citas por sucursal obtenidos con éxito',
        data: citasData,
      };

      /*  this.logger.log(`Respuesta del servicio: ${JSON.stringify(response)}`); // Log antes de retornar */

      return response;
    } catch (error) {
      this.logger.error(
        `Error al obtener datos de citas por sucursal: ${error.message}`,
        error.stack,
      );
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error al obtener datos de citas por sucursal',
        error: error.message,
      };
    }
  }
  // Añadir este método a la clase DashboardService existente

  /**
   * Obtiene datos de los 12 servicios más demandados por sucursal
   * @returns Datos de servicios agrupados por sucursal
   */
  async getTopServicesBySucursal() {
    try {
      this.logger.log('Iniciando consulta de top servicios por sucursal');

      const serviciosData =
        await this.dashboardRepository.getTopServicesBySucursal();

      this.logger.log(`Datos obtenidos: ${serviciosData.length} servicios`);

      return {
        statusCode: HttpStatus.OK,
        message: 'Top servicios por sucursal obtenidos con éxito',
        data: serviciosData,
      };
    } catch (error) {
      this.logger.error(
        `Error al obtener top servicios por sucursal: ${error.message}`,
        error.stack,
      );
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error al obtener top servicios por sucursal',
        error: error.message,
      };
    }
  }

  // Añadir este método a la clase DashboardService existente

  /**
   * Obtiene datos de cotizaciones por estado (pagadas vs pendientes)
   * @returns Datos de cotizaciones agrupados por mes y estado
   */
  async getCotizacionesPorEstado() {
    try {
      this.logger.log('Iniciando consulta de cotizaciones por estado');

      const cotizacionesData =
        await this.dashboardRepository.getCotizacionesPorEstado();

      this.logger.log(`Datos obtenidos: ${cotizacionesData.length} registros`);

      return {
        statusCode: HttpStatus.OK,
        message: 'Datos de cotizaciones por estado obtenidos con éxito',
        data: cotizacionesData,
      };
    } catch (error) {
      this.logger.error(
        `Error al obtener cotizaciones por estado: ${error.message}`,
        error.stack,
      );
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error al obtener cotizaciones por estado',
        error: error.message,
      };
    }
  }

  // Añadir este método a la clase DashboardService existente

  /**
   * Obtiene datos de ingresos por sucursal para el dashboard KPI
   * @returns Datos de ingresos agrupados por día y sucursal
   */
  async getIngresosPorSucursal() {
    try {
      this.logger.log('Iniciando consulta de ingresos por sucursal');

      const ingresosData =
        await this.dashboardRepository.getIngresosPorSucursal();

      // Obtener un listado de todas las sucursales disponibles en los datos
      const sucursales = new Set<string>();
      ingresosData.forEach((dia) => {
        Object.keys(dia).forEach((key) => {
          if (key !== 'date') {
            sucursales.add(key);
          }
        });
      });

      this.logger.log(
        `Datos obtenidos para ${ingresosData.length} días y ${sucursales.size} sucursales`,
      );

      return {
        statusCode: HttpStatus.OK,
        message: 'Ingresos por sucursal obtenidos con éxito',
        data: {
          ingresos: ingresosData,
          sucursales: Array.from(sucursales),
        },
      };
    } catch (error) {
      this.logger.error(
        `Error al obtener ingresos por sucursal: ${error.message}`,
        error.stack,
      );
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error al obtener ingresos por sucursal',
        error: error.message,
      };
    }
  }
}
