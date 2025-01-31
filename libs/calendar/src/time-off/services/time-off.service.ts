import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { CreateTimeOffDto, UpdateTimeOffDto, DeleteTimeOffsDto } from '../dto';
import { UserData } from '@login/login/interfaces';
import { TimeOff } from '../entities/time-off.entity';
import { validateArray, validateChanges } from '@prisma/prisma/utils';
import { TimeOffRepository } from '../repositories/time-off.repository';
import { BaseErrorHandler } from 'src/common/error-handlers/time-off-error.handler';
import {
  CreateTimeOffUseCase,
  UpdateTimeOffUseCase,
  DeleteTimeOffsUseCase,
  ReactivateTimeOffsUseCase,
} from '../use-cases';
import { timeOffErrorMessages } from '../errors/errors-time-off';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';

/**
 * Servicio que implementa la lógica de negocio para solicitudes de tiempo libre.
 * Utiliza TimeOffRepository para acceder a la base de datos y varios casos de uso
 * para implementar las operaciones principales.
 */
@Injectable()
export class TimeOffService {
  private readonly logger = new Logger(TimeOffService.name);
  private readonly errorHandler: BaseErrorHandler;

  constructor(
    private readonly timeOffRepository: TimeOffRepository,
    private readonly createTimeOffUseCase: CreateTimeOffUseCase,
    // private readonly updateTimeOffUseCase: UpdateTimeOffUseCase,
    // private readonly deleteTimeOffsUseCase: DeleteTimeOffsUseCase,
    // private readonly reactivateTimeOffsUseCase: ReactivateTimeOffsUseCase,
  ) {
    this.errorHandler = new BaseErrorHandler(
      this.logger,
      'TiempoLibre',
      timeOffErrorMessages,
    );
  }

  /**
   * Crea una nueva solicitud de tiempo libre.
   * @param createTimeOffDto - DTO con los datos de la solicitud a crear.
   * @param user - Datos del usuario que realiza la operación.
   * @returns Respuesta HTTP con la solicitud creada.
   * @throws {BadRequestException} Si los datos de la solicitud son inválidos.
   */
  async create(
    createTimeOffDto: CreateTimeOffDto,
    user: UserData,
  ): Promise<BaseApiResponse<TimeOff>> {
    try {
      return await this.createTimeOffUseCase.execute(createTimeOffDto, user);
    } catch (error) {
      this.errorHandler.handleError(error, 'creating');
    }
  }

//   /**
//    * Actualiza una solicitud de tiempo libre existente.
//    * @param id - ID de la solicitud a actualizar.
//    * @param updateTimeOffDto - DTO con los datos a actualizar.
//    * @param user - Datos del usuario que realiza la operación.
//    * @returns Respuesta HTTP con la solicitud actualizada.
//    * @throws {BadRequestException} Si la solicitud no existe o los datos son inválidos.
//    */
//   async update(
//     id: string,
//     updateTimeOffDto: UpdateTimeOffDto,
//     user: UserData,
//   ): Promise<BaseApiResponse<TimeOff>> {
//     try {
//       const currentTimeOff = await this.findById(id);

//       if (!validateChanges(updateTimeOffDto, currentTimeOff)) {
//         this.logger.log('No hay cambios significativos, omitiendo actualización');
//         return {
//           success: true,
//           message: 'Solicitud de tiempo libre actualizada correctamente',
//           data: currentTimeOff,
//         };
//       }

//       return await this.updateTimeOffUseCase.execute(id, updateTimeOffDto, user);
//     } catch (error) {
//       this.errorHandler.handleError(error, 'updating');
//     }
//   }

  /**
   * Busca una solicitud de tiempo libre por su ID.
   * @param id - ID de la solicitud a buscar.
   * @returns La solicitud encontrada.
   * @throws {BadRequestException} Si la solicitud no existe.
   */
  async findOne(id: string): Promise<TimeOff> {
    try {
      return await this.timeOffRepository.findById(id);
    } catch (error) {
      this.errorHandler.handleError(error, 'getting');
    }
  }

  /**
   * Obtiene todas las solicitudes de tiempo libre.
   * @returns Lista de todas las solicitudes.
   */
  async findAll(): Promise<TimeOff[]> {
    try {
      return this.timeOffRepository.findMany();
    } catch (error) {
      this.errorHandler.handleError(error, 'getting');
    }
  }

//   /**
//    * Desactiva múltiples solicitudes de tiempo libre.
//    * @param deleteTimeOffsDto - DTO con los IDs de las solicitudes a desactivar.
//    * @param user - Datos del usuario que realiza la operación.
//    * @returns Respuesta HTTP con las solicitudes desactivadas.
//    * @throws {BadRequestException} Si alguna solicitud no existe.
//    */
//   async deleteMany(
//     deleteTimeOffsDto: DeleteTimeOffsDto,
//     user: UserData,
//   ): Promise<BaseApiResponse<TimeOff[]>> {
//     try {
//       validateArray(deleteTimeOffsDto.ids, 'IDs de solicitudes de tiempo libre');
//       return await this.deleteTimeOffsUseCase.execute(deleteTimeOffsDto, user);
//     } catch (error) {
//       this.errorHandler.handleError(error, 'deactivating');
//     }
//   }

//   /**
//    * Reactiva múltiples solicitudes de tiempo libre.
//    * @param ids - Lista de IDs de las solicitudes a reactivar.
//    * @param user - Datos del usuario que realiza la operación.
//    * @returns Respuesta HTTP con las solicitudes reactivadas.
//    * @throws {BadRequestException} Si alguna solicitud no existe.
//    */
//   async reactivateMany(
//     ids: string[],
//     user: UserData,
//   ): Promise<BaseApiResponse<TimeOff[]>> {
//     try {
//       validateArray(ids, 'IDs de solicitudes de tiempo libre');
//       return await this.reactivateTimeOffsUseCase.execute(ids, user);
//     } catch (error) {
//       this.errorHandler.handleError(error, 'reactivating');
//     }
//   }

}