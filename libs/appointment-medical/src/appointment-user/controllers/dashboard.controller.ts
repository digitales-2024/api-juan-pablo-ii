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
  // Añadir este endpoint a la clase DashboardController existente

  /**
   * Obtiene los 12 servicios más demandados por sucursal
   */
  @Get('/top-servicios-por-sucursal')
  @ApiOperation({
    summary: 'Obtener top 12 servicios más demandados por sucursal',
  })
  @ApiResponse({
    status: 200,
    description: 'Top servicios agrupados por sucursal',
    schema: {
      properties: {
        statusCode: { type: 'number', example: 200 },
        message: {
          type: 'string',
          example: 'Top servicios por sucursal obtenidos con éxito',
        },
        data: {
          type: 'array',
          items: {
            properties: {
              serviceName: { type: 'string', example: 'Consulta General' },
              JLBYR: { type: 'number', example: 120 },
              Yanahuara: { type: 'number', example: 80 },
            },
          },
        },
      },
    },
  })
  async getTopServicesBySucursal() {
    this.logger.log(
      'Iniciando solicitud para obtener top servicios por sucursal',
    );

    try {
      const response = await this.dashboardService.getTopServicesBySucursal();
      return response;
    } catch (error) {
      this.logger.error(`Error al procesar la solicitud: ${error.message}`);
      throw error;
    }
  }

  // Añadir este endpoint a la clase DashboardController existente

  /**
   * Obtiene datos de cotizaciones pagadas vs pendientes
   */
  @Get('/cotizaciones-por-estado')
  @ApiOperation({
    summary: 'Obtener datos de cotizaciones pagadas vs pendientes',
  })
  @ApiResponse({
    status: 200,
    description: 'Datos de cotizaciones agrupados por mes y estado',
    schema: {
      properties: {
        statusCode: { type: 'number', example: 200 },
        message: {
          type: 'string',
          example: 'Datos de cotizaciones por estado obtenidos con éxito',
        },
        data: {
          type: 'array',
          items: {
            properties: {
              month: { type: 'string', example: 'Enero' },
              pendientes: { type: 'number', example: 12 },
              pagadas: { type: 'number', example: 8 },
            },
          },
        },
      },
    },
  })
  async getCotizacionesPorEstado() {
    this.logger.log('Iniciando solicitud para obtener cotizaciones por estado');

    try {
      const response = await this.dashboardService.getCotizacionesPorEstado();
      return response;
    } catch (error) {
      this.logger.error(`Error al procesar la solicitud: ${error.message}`);
      throw error;
    }
  }

  // Añadir este endpoint a la clase DashboardController existente

  /**
   * Obtiene ingresos diarios por sucursal
   */
  @Get('/ingresos-por-sucursal')
  @ApiOperation({ summary: 'Obtener ingresos diarios por sucursal' })
  @ApiResponse({
    status: 200,
    description: 'Ingresos agrupados por día y sucursal',
    schema: {
      properties: {
        statusCode: { type: 'number', example: 200 },
        message: {
          type: 'string',
          example: 'Ingresos por sucursal obtenidos con éxito',
        },
        data: {
          type: 'object',
          properties: {
            ingresos: {
              type: 'array',
              items: {
                type: 'object',
                example: {
                  date: '2023-01-01',
                  JLBYR: 1200,
                  Yanahuara: 950,
                },
              },
            },
            sucursales: {
              type: 'array',
              items: { type: 'string' },
              example: ['JLBYR', 'Yanahuara'],
            },
          },
        },
      },
    },
  })
  async getIngresosPorSucursal() {
    this.logger.log('Iniciando solicitud para obtener ingresos por sucursal');

    try {
      const response = await this.dashboardService.getIngresosPorSucursal();
      return response;
    } catch (error) {
      this.logger.error(`Error al procesar la solicitud: ${error.message}`);
      throw error;
    }
  }
}
