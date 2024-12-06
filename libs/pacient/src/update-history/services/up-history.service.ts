import {
  BadRequestException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { UpHistoryRepository } from '../repositories/up-history.repository';
import { UpHistory } from '../entities/up-history.entity';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { validateArray, validateChanges } from '@prisma/prisma/utils';
import { BaseErrorHandler } from 'src/common/error-handlers/service-error.handler';
import { upHistoryErrorMessages } from '../errors/errors-up-history';
import {
  CreateUpHistoryDto,
  UpdateUpHistoryDto,
  DeleteUpHistoryDto,
} from '../dto';
import {
  CreateUpHistoryUseCase,
  UpdateUpHistoryUseCase,
  DeleteUpHistoriesUseCase,
  ReactivateUpHistoryUseCase,
} from '../use-cases';

// Constantes para nombres de tablas
const TABLE_NAMES = {
  CONSULTA_MEDICA: 'consultaMedica',
  PERSONAL: 'personal',
  SUCURSAL: 'sucursal',
  HISTORIA_MEDICA: 'historiaMedica',
} as const;

@Injectable()
export class UpHistoryService {
  private readonly logger = new Logger(UpHistoryService.name);
  private readonly errorHandler: BaseErrorHandler;

  constructor(
    private readonly upHistoryRepository: UpHistoryRepository,
    private readonly createUpHistoryUseCase: CreateUpHistoryUseCase,
    private readonly updateUpHistoryUseCase: UpdateUpHistoryUseCase,
    private readonly deleteUpHistoriesUseCase: DeleteUpHistoriesUseCase,
    private readonly reactivateUpHistoryUseCase: ReactivateUpHistoryUseCase,
  ) {
    this.errorHandler = new BaseErrorHandler(
      this.logger,
      'UpHistory',
      upHistoryErrorMessages,
    );
  }

  /**
   * Valida las referencias a otras tablas
   */
  private async validateReferences(
    dto: CreateUpHistoryDto | UpdateUpHistoryDto,
  ) {
    // Validar ConsultaMedica
    const consultaExists = await this.upHistoryRepository.findByIdValidate(
      TABLE_NAMES.CONSULTA_MEDICA,
      dto.consultaMedicaId,
    );
    if (!consultaExists) {
      throw new BadRequestException('Consulta médica no encontrada');
    }

    // Validar Personal
    const personalExists = await this.upHistoryRepository.findByIdValidate(
      TABLE_NAMES.PERSONAL,
      dto.personalId,
    );
    if (!personalExists) {
      throw new BadRequestException('Personal no encontrado');
    }

    // Validar Sucursal
    const sucursalExists = await this.upHistoryRepository.findByIdValidate(
      TABLE_NAMES.SUCURSAL,
      dto.sucursalId,
    );
    if (!sucursalExists) {
      throw new BadRequestException('Sucursal no encontrada');
    }

    // Validar HistoriaMedica
    const historiaExists = await this.upHistoryRepository.findByIdValidate(
      TABLE_NAMES.HISTORIA_MEDICA,
      dto.historiaMedicaId,
    );
    if (!historiaExists) {
      throw new BadRequestException('Historia médica no encontrada');
    }
  }

  /**
   * Crea una nueva actualización de historia médica
   */
  async create(
    createUpHistoryDto: CreateUpHistoryDto,
    user: UserData,
  ): Promise<HttpResponse<UpHistory>> {
    try {
      await this.validateReferences(createUpHistoryDto);
      return await this.createUpHistoryUseCase.execute(
        createUpHistoryDto,
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
    updateUpHistoryDto: UpdateUpHistoryDto,
    user: UserData,
  ): Promise<HttpResponse<UpHistory>> {
    try {
      const currentUpHistory = await this.findById(id);

      if (!validateChanges(updateUpHistoryDto, currentUpHistory)) {
        return {
          statusCode: HttpStatus.OK,
          message:
            'No se detectaron cambios en la actualización de historia médica',
          data: currentUpHistory,
        };
      }

      await this.validateReferences(updateUpHistoryDto);
      return await this.updateUpHistoryUseCase.execute(
        id,
        updateUpHistoryDto,
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
  async findOne(id: string): Promise<UpHistory> {
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
  async findAll(): Promise<UpHistory[]> {
    try {
      return this.upHistoryRepository.findMany();
    } catch (error) {
      this.errorHandler.handleError(error, 'getting');
      throw error;
    }
  }

  /**
   * Busca una actualización de historia médica por su ID
   */
  async findById(id: string): Promise<UpHistory> {
    const upHistory = await this.upHistoryRepository.findById(id);
    if (!upHistory) {
      throw new BadRequestException(
        'Actualización de historia médica no encontrada',
      );
    }
    return upHistory;
  }

  /**
   * Desactiva múltiples actualizaciones de historias médicas
   */
  async deleteMany(
    deleteUpHistoryDto: DeleteUpHistoryDto,
    user: UserData,
  ): Promise<HttpResponse<UpHistory[]>> {
    try {
      validateArray(
        deleteUpHistoryDto.ids,
        'IDs de actualizaciones de historias médicas',
      );
      return await this.deleteUpHistoriesUseCase.execute(
        deleteUpHistoryDto,
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
  ): Promise<HttpResponse<UpHistory[]>> {
    try {
      validateArray(ids, 'IDs de actualizaciones de historias médicas');
      return await this.reactivateUpHistoryUseCase.execute(ids, user);
    } catch (error) {
      this.errorHandler.handleError(error, 'reactivating');
      throw error;
    }
  }
}
