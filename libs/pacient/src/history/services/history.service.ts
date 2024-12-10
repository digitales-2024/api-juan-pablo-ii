import {
  BadRequestException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { HistoryRepository } from '../repositories/history.repository';
import { History } from '../entities/history.entity';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { validateArray, validateChanges } from '@prisma/prisma/utils';
import { BaseErrorHandler } from 'src/common/error-handlers/service-error.handler';
import { historyErrorMessages } from '../errors/errors-history';
import { CreateHistoryDto, UpdateHistoryDto, DeleteHistoryDto } from '../dto';
import {
  CreateHistoryUseCase,
  UpdateHistoryUseCase,
  DeleteHistoriesUseCase,
  ReactivateHistoryUseCase,
} from '../use-cases';

// Constantes para nombres de tablas
const TABLE_NAMES = {
  PACIENTE: 'paciente',
} as const;

@Injectable()
export class HistoryService {
  private readonly logger = new Logger(HistoryService.name);
  private readonly errorHandler: BaseErrorHandler;

  constructor(
    private readonly historyRepository: HistoryRepository,
    private readonly createHistoryUseCase: CreateHistoryUseCase,
    private readonly updateHistoryUseCase: UpdateHistoryUseCase,
    private readonly deleteHistoriesUseCase: DeleteHistoriesUseCase,
    private readonly reactivateHistoryUseCase: ReactivateHistoryUseCase,
  ) {
    this.errorHandler = new BaseErrorHandler(
      this.logger,
      'History',
      historyErrorMessages,
    );
  }

  /**
   * Valida las referencias a otras tablas
   */
  private async validateReferences(dto: CreateHistoryDto | UpdateHistoryDto) {
    // Validar Paciente
    const pacienteExists = await this.historyRepository.findByIdValidate(
      TABLE_NAMES.PACIENTE,
      dto.pacienteId,
    );
    if (!pacienteExists) {
      throw new BadRequestException('Paciente no encontrado');
    }
  }

  /**
   * Crea una nueva historia médica
   */
  async create(
    createHistoryDto: CreateHistoryDto,
    user: UserData,
  ): Promise<HttpResponse<History>> {
    try {
      await this.validateReferences(createHistoryDto);
      return await this.createHistoryUseCase.execute(createHistoryDto, user);
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
    updateHistoryDto: UpdateHistoryDto,
    user: UserData,
  ): Promise<HttpResponse<History>> {
    try {
      const currentHistory = await this.findById(id);

      if (!validateChanges(updateHistoryDto, currentHistory)) {
        return {
          statusCode: HttpStatus.OK,
          message: 'No se detectaron cambios en la historia médica',
          data: currentHistory,
        };
      }

      await this.validateReferences(updateHistoryDto);
      return await this.updateHistoryUseCase.execute(
        id,
        updateHistoryDto,
        user,
      );
    } catch (error) {
      this.errorHandler.handleError(error, 'updating');
      throw error;
    }
  }

  /**
   * Busca una historia médica por su ID
   */
  async findOne(id: string): Promise<History> {
    try {
      return this.findById(id);
    } catch (error) {
      this.errorHandler.handleError(error, 'getting');
      throw error;
    }
  }

  /**
   * Obtiene todas las historias médicas
   */
  async findAll(): Promise<History[]> {
    try {
      return this.historyRepository.findMany();
    } catch (error) {
      this.errorHandler.handleError(error, 'getting');
      throw error;
    }
  }

  /**
   * Busca una historia médica por su ID
   */
  async findById(id: string): Promise<History> {
    const history = await this.historyRepository.findById(id);
    if (!history) {
      throw new BadRequestException('Historia médica no encontrada');
    }
    return history;
  }

  /**
   * Desactiva múltiples historias médicas
   */
  async deleteMany(
    deleteHistoryDto: DeleteHistoryDto,
    user: UserData,
  ): Promise<HttpResponse<History[]>> {
    try {
      validateArray(deleteHistoryDto.ids, 'IDs de historias médicas');
      return await this.deleteHistoriesUseCase.execute(deleteHistoryDto, user);
    } catch (error) {
      this.errorHandler.handleError(error, 'deactivating');
      throw error;
    }
  }

  /**
   * Reactiva múltiples historias médicas
   */
  async reactivateMany(
    ids: string[],
    user: UserData,
  ): Promise<HttpResponse<History[]>> {
    try {
      validateArray(ids, 'IDs de historias médicas');
      return await this.reactivateHistoryUseCase.execute(ids, user);
    } catch (error) {
      this.errorHandler.handleError(error, 'reactivating');
      throw error;
    }
  }
}
