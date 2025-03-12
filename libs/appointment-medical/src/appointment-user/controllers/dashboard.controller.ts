import { Controller, Get, Logger } from '@nestjs/common';
import { DashboardService } from '../services/dashboard.service';
import { Auth } from '@login/login/admin/auth/decorators';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Dashboard')
@Controller({ path: 'dashboard', version: '1' })
@Auth()
export class DashboardController {
  private readonly logger = new Logger(DashboardController.name);

  constructor(private readonly dashboardService: DashboardService) {}

  /**
   * Obtiene datos de citas por sucursal para el KPI
   */
  @Get('/citas-por-sucursal')
  @ApiOperation({ summary: 'Obtener datos de citas por sucursal para KPI' })
  @ApiResponse({
    status: 200,
    description: 'Datos de citas agrupados por mes y sucursal',
    schema: {
      properties: {
        statusCode: { type: 'number', example: 200 },
        message: {
          type: 'string',
          example: 'Datos de citas por sucursal obtenidos con éxito',
        },
        data: {
          type: 'array',
          items: {
            properties: {
              month: { type: 'string', example: 'Enero' },
              JLBYR: { type: 'number', example: 12 },
              Yanahuara: { type: 'number', example: 8 },
            },
          },
        },
      },
    },
  })
  async getCitasPorSucursal() {
    /*  this.logger.log('Iniciando solicitud para obtener citas por sucursal'); */

    try {
      const response = await this.dashboardService.getCitasPorSucursal();

      /*      this.logger.log(`Respuesta a enviar: ${JSON.stringify(response)}`); */

      return response;
    } catch (error) {
      /*       this.logger.error(`Error al procesar la solicitud: ${error.message}`); */
      throw error;
    }
  }
}
