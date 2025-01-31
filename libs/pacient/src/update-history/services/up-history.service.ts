import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { UpdateHistoryRepository } from '../repositories/up-history.repository';
import { UpdateHistory } from '../entities/up-history.entity';
import { UserData } from '@login/login/interfaces';
import { validateArray, validateChanges } from '@prisma/prisma/utils';
import { BaseErrorHandler } from 'src/common/error-handlers/service-error.handler';
import { upHistoryErrorMessages } from '../errors/errors-up-history';
import {
  CreateUpdateHistoryDto,
  UpdateUpdateHistoryDto,
  DeleteUpdateHistoryDto,
} from '../dto';
import {
  CreateUpdateHistoryUseCase,
  UpdateUpdateHistoryUseCase,
  DeleteUpdateHistoriesUseCase,
  ReactivateUpdateHistoryUseCase,
} from '../use-cases';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';

// Constantes para nombres de tablas
const TABLE_NAMES = {
  SERVICE: 'service',
  STAFF: 'staff',
  BRANCH: 'branch',
  MEDICAL_HISTORY: 'medicalHistory',
} as const;

@Injectable()
export class UpdateHistoryService {
  private readonly logger = new Logger(UpdateHistoryService.name);
  private readonly errorHandler: BaseErrorHandler;

  constructor(
    private readonly updateHistoryRepository: UpdateHistoryRepository,
    private readonly createUpdateHistoryUseCase: CreateUpdateHistoryUseCase,
    private readonly updateUpdateHistoryUseCase: UpdateUpdateHistoryUseCase,
    private readonly deleteUpdateHistoriesUseCase: DeleteUpdateHistoriesUseCase,
    private readonly reactivateUpdateHistoryUseCase: ReactivateUpdateHistoryUseCase,
  ) {
    this.errorHandler = new BaseErrorHandler(
      this.logger,
      'UpdateHistory',
      upHistoryErrorMessages,
    );
  }

  /**
   * Valida las referencias a otras tablas
   */
  private async validateReferences(
    dto: CreateUpdateHistoryDto | UpdateUpdateHistoryDto,
  ) {
    // Validar Servicio
    const serviceExists = await this.updateHistoryRepository.findByIdValidate(
      TABLE_NAMES.SERVICE,
      dto.serviceId,
    );
    if (!serviceExists) {
      throw new BadRequestException('Servicio no encontrado');
    }

    // Validar Personal
    const staffExists = await this.updateHistoryRepository.findByIdValidate(
      TABLE_NAMES.STAFF,
      dto.staffId,
    );
    if (!staffExists) {
      throw new BadRequestException('Personal no encontrado');
    }

    // Validar Sucursal
    const branchExists = await this.updateHistoryRepository.findByIdValidate(
      TABLE_NAMES.BRANCH,
      dto.branchId,
    );
    if (!branchExists) {
      throw new BadRequestException('Sucursal no encontrada');
    }

    // Validar HistoriaMedica
    const medicalHistoryExists =
      await this.updateHistoryRepository.findByIdValidate(
        TABLE_NAMES.MEDICAL_HISTORY,
        dto.medicalHistoryId,
      );
    if (!medicalHistoryExists) {
      throw new BadRequestException('Historia médica no encontrada');
    }
  }

  /**
   * Crea una nueva actualización de historia médica
   */
  async create(
    createUpdateHistoryDto: CreateUpdateHistoryDto,
    user: UserData,
  ): Promise<BaseApiResponse<UpdateHistory>> {
    try {
      await this.validateReferences(createUpdateHistoryDto);
      return await this.createUpdateHistoryUseCase.execute(
        createUpdateHistoryDto,
        user,
      );
    } catch (error) {
      this.errorHandler.handleError(error, 'creating');
      throw error;
    }
  }

  /**
   * Actualiza una historia médica existente
   */
  async update(
    id: string,
    updateUpdateHistoryDto: UpdateUpdateHistoryDto,
    user: UserData,
  ): Promise<BaseApiResponse<UpdateHistory>> {
    try {
      const currentUpdateHistory = await this.findById(id);

      if (!validateChanges(updateUpdateHistoryDto, currentUpdateHistory)) {
        return {
          success: true,
          message:
            'No se detectaron cambios en la actualización de historia médica',
          data: currentUpdateHistory,
        };
      }

      await this.validateReferences(updateUpdateHistoryDto);
      return await this.updateUpdateHistoryUseCase.execute(
        id,
        updateUpdateHistoryDto,
        user,
      );
    } catch (error) {
      this.errorHandler.handleError(error, 'updating');
      throw error;
    }
  }

  /**
   * Busca una actualización de historia médica por su ID
   */
  async findOne(id: string): Promise<UpdateHistory> {
    try {
      return this.findById(id);
    } catch (error) {
      this.errorHandler.handleError(error, 'getting');
      throw error;
    }
  }

  /**
   * Obtiene todas las actualizaciones de historias médicas
   */
  async findAll(): Promise<UpdateHistory[]> {
    try {
      return this.updateHistoryRepository.findMany();
    } catch (error) {
      this.errorHandler.handleError(error, 'getting');
      throw error;
    }
  }

  /**
   * Busca una actualización de historia médica por su ID
   */
  async findById(id: string): Promise<UpdateHistory> {
    const updateHistory = await this.updateHistoryRepository.findById(id);
    if (!updateHistory) {
      throw new BadRequestException(
        'Actualización de historia médica no encontrada',
      );
    }
    return updateHistory;
  }

  /**
   * Desactiva múltiples actualizaciones de historias médicas
   */
  async deleteMany(
    deleteUpdateHistoryDto: DeleteUpdateHistoryDto,
    user: UserData,
  ): Promise<BaseApiResponse<UpdateHistory[]>> {
    try {
      validateArray(
        deleteUpdateHistoryDto.ids,
        'IDs de actualizaciones de historias médicas',
      );
      return await this.deleteUpdateHistoriesUseCase.execute(
        deleteUpdateHistoryDto,
        user,
      );
    } catch (error) {
      this.errorHandler.handleError(error, 'deactivating');
      throw error;
    }
  }

  /**
   * Reactiva múltiples actualizaciones de historias médicas
   */
  async reactivateMany(
    ids: string[],
    user: UserData,
  ): Promise<BaseApiResponse<UpdateHistory[]>> {
    try {
      validateArray(ids, 'IDs de actualizaciones de historias médicas');
      return await this.reactivateUpdateHistoryUseCase.execute(ids, user);
    } catch (error) {
      this.errorHandler.handleError(error, 'reactivating');
      throw error;
    }
  }
}
