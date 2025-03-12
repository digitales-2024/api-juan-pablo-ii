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
}
