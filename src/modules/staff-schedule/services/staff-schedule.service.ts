import { Injectable, Logger } from '@nestjs/common';
import { StaffScheduleRepository } from '../repositories/staff-schedule.repository';
import { StaffSchedule } from '../entities/staff-schedule.entity';
import { BaseErrorHandler } from 'src/common/error-handlers/service-error.handler';
import { staffScheduleErrorMessages } from '../errors/errors-staff-schedule';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';
import { CreateStaffScheduleDto } from '../dto/create-staff-schedule.dto';
import { UpdateStaffScheduleDto } from '../dto/update-staff-schedule.dto';
import { UserData } from '@login/login/interfaces';
import { validateArray, validateChanges } from '@prisma/prisma/utils';
import { DeleteStaffSchedulesDto } from '../dto/delete-staff-schedule.dto';
import {
  CreateStaffScheduleUseCase,
  DeleteStaffSchedulesUseCase,
  ReactivateStaffSchedulesUseCase,
  UpdateStaffScheduleUseCase,
  FindStaffSchedulesByFilterUseCase,
} from '../use-cases';
import { FindStaffSchedulesQueryDto } from '../dto/find-staff-schedule-query.dto';

@Injectable()
export class StaffScheduleService {
  private readonly logger = new Logger(StaffScheduleService.name);
  private readonly errorHandler: BaseErrorHandler;

  constructor(
    private readonly staffScheduleRepository: StaffScheduleRepository,
    private readonly createStaffScheduleUseCase: CreateStaffScheduleUseCase,
    private readonly updateStaffScheduleUseCase: UpdateStaffScheduleUseCase,
    private readonly deleteStaffSchedulesUseCase: DeleteStaffSchedulesUseCase,
    private readonly reactivateStaffSchedulesUseCase: ReactivateStaffSchedulesUseCase,
    private readonly findStaffSchedulesByFilterUseCase: FindStaffSchedulesByFilterUseCase,
  ) {
    this.errorHandler = new BaseErrorHandler(
      this.logger,
      'Horario del personal',
      staffScheduleErrorMessages,
    );
  }

  /**
   * Crea un nuevo horario para el personal.
   * @param createStaffScheduleDto - DTO con los datos del nuevo horario
   * @param user - Datos del usuario que crea el horario
   * @returns Respuesta HTTP con el horario creado
   * @throws Lanza errores en caso de fallo en la creación
   */
  async create(
    createStaffScheduleDto: CreateStaffScheduleDto,
    user: UserData,
  ): Promise<BaseApiResponse<StaffSchedule>> {
    try {
      return await this.createStaffScheduleUseCase.execute(
        createStaffScheduleDto,
        user,
      );
    } catch (error) {
      this.errorHandler.handleError(error, 'creating');
    }
  }

  /**
   * Busca un horario del personal por su ID.
   * @param id - ID del horario a buscar
   * @returns El horario encontrado
   * @throws Lanza un error si el horario no existe
   */
  async findOne(id: string): Promise<StaffSchedule> {
    try {
      return await this.staffScheduleRepository.findStaffScheduleById(id);
    } catch (error) {
      this.errorHandler.handleError(error, 'getting');
    }
  }

  /**
   * Obtiene la lista de todos los horarios del personal con información básica del staff y la sucursal
   * @returns Lista de horarios con nombre y apellido del staff y nombre de la sucursal
   * @throws Lanza un error en caso de fallo al obtener los datos
   */
  async findAll(): Promise<StaffSchedule[]> {
    try {
      const staffSchedule =
        await this.staffScheduleRepository.findWithRelations(
          
        );
      return staffSchedule.reverse();
    } catch (error) {
      this.errorHandler.handleError(error, 'getting');
    }
  }

  /**
   * Actualiza un horario existente.
   * Primero valida si existen cambios en los datos recibidos y,
   * en caso afirmativo, delega la actualización al caso de uso.
   */
  async update(
    id: string,
    updateStaffScheduleDto: UpdateStaffScheduleDto,
    user: UserData,
  ): Promise<BaseApiResponse<StaffSchedule>> {
    try {
      const currentSchedule =
        await this.staffScheduleRepository.findStaffScheduleById(id);

      if (!validateChanges(updateStaffScheduleDto, currentSchedule)) {
        return {
          success: true,
          message: 'Horario del personal actualizado exitosamente',
          data: currentSchedule,
        };
      }

      return await this.updateStaffScheduleUseCase.execute(
        id,
        updateStaffScheduleDto,
        user,
      );
    } catch (error) {
      this.errorHandler.handleError(error, 'updating');
    }
  }

  async deleteMany(
    deleteStaffSchedulesDto: DeleteStaffSchedulesDto,
    user: UserData,
  ): Promise<BaseApiResponse<StaffSchedule[]>> {
    try {
      validateArray(deleteStaffSchedulesDto.ids, 'IDs de horarios');
      return await this.deleteStaffSchedulesUseCase.execute(
        deleteStaffSchedulesDto,
        user,
      );
    } catch (error) {
      this.errorHandler.handleError(error, 'deactivating');
    }
  }

  async reactivateMany(
    ids: string[],
    user: UserData,
  ): Promise<BaseApiResponse<StaffSchedule[]>> {
    try {
      validateArray(ids, 'IDs de horarios');
      return await this.reactivateStaffSchedulesUseCase.execute(ids, user);
    } catch (error) {
      this.errorHandler.handleError(error, 'reactivating');
    }
  }

  async findManyByStaffAndBranch(
    query: FindStaffSchedulesQueryDto,
  ): Promise<StaffSchedule[]> {
    try {
      const result =
        await this.findStaffSchedulesByFilterUseCase.execute(query);
      return result;
    } catch (error) {
      this.errorHandler.handleError(error, 'getting');
    }
  }
}
