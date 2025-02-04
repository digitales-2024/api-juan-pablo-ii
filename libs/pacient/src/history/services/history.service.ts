import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { MedicalHistoryRepository } from '../repositories/history.repository';
import { MedicalHistory } from '../entities/history.entity';
import { UserData } from '@login/login/interfaces';
import { validateArray, validateChanges } from '@prisma/prisma/utils';
import { BaseErrorHandler } from 'src/common/error-handlers/service-error.handler';
import { historyErrorMessages } from '../errors/errors-history';
import {
  CreateMedicalHistoryDto,
  UpdateMedicalHistoryDto,
  DeleteMedicalHistoryDto,
} from '../dto';
import {
  CreateMedicalHistoryUseCase,
  UpdateMedicalHistoryUseCase,
  DeleteMedicalHistoriesUseCase,
  ReactivateMedicalHistoryUseCase,
} from '../use-cases';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';

// Constantes para nombres de tablas
const TABLE_NAMES = {
  PATIENT: 'patient',
} as const;

@Injectable()
export class MedicalHistoryService {
  private readonly logger = new Logger(MedicalHistoryService.name);
  private readonly errorHandler: BaseErrorHandler;

  constructor(
    private readonly medicalHistoryRepository: MedicalHistoryRepository,
    private readonly createMedicalHistoryUseCase: CreateMedicalHistoryUseCase,
    private readonly updateMedicalHistoryUseCase: UpdateMedicalHistoryUseCase,
    private readonly deleteMedicalHistoriesUseCase: DeleteMedicalHistoriesUseCase,
    private readonly reactivateMedicalHistoryUseCase: ReactivateMedicalHistoryUseCase,
  ) {
    this.errorHandler = new BaseErrorHandler(
      this.logger,
      'MedicalHistory',
      historyErrorMessages,
    );
  }

  /**
   * Valida las referencias a otras tablas
   */
  private async validateReferences(
    dto: CreateMedicalHistoryDto | UpdateMedicalHistoryDto,
  ) {
    // Validar Paciente
    const patientExists = await this.medicalHistoryRepository.findByIdValidate(
      TABLE_NAMES.PATIENT,
      dto.patientId,
    );
    if (!patientExists) {
      throw new BadRequestException('Paciente no encontrado');
    }
  }

  /**
   * Crea una nueva historia médica
   */
  async create(
    createMedicalHistoryDto: CreateMedicalHistoryDto,
    user: UserData,
  ): Promise<BaseApiResponse<MedicalHistory>> {
    try {
      await this.validateReferences(createMedicalHistoryDto);
      return await this.createMedicalHistoryUseCase.execute(
        createMedicalHistoryDto,
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
    updateMedicalHistoryDto: UpdateMedicalHistoryDto,
    user: UserData,
  ): Promise<BaseApiResponse<MedicalHistory>> {
    try {
      const currentMedicalHistory = await this.findById(id);

      if (!validateChanges(updateMedicalHistoryDto, currentMedicalHistory)) {
        return {
          success: true,
          message: 'No se detectaron cambios en la historia médica',
          data: currentMedicalHistory,
        };
      }

      await this.validateReferences(updateMedicalHistoryDto);

      return await this.updateMedicalHistoryUseCase.execute(
        id,
        updateMedicalHistoryDto,
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
  async findOne(id: string): Promise<MedicalHistory> {
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
  async findAll(): Promise<MedicalHistory[]> {
    try {
      return this.medicalHistoryRepository.findMany();
    } catch (error) {
      this.errorHandler.handleError(error, 'getting');
      throw error;
    }
  }

  /**
   * Busca una historia médica por su ID
   */
  async findById(id: string): Promise<MedicalHistory> {
    const medicalHistory = await this.medicalHistoryRepository.findById(id);
    if (!medicalHistory) {
      throw new BadRequestException('Historia médica no encontrada');
    }
    return medicalHistory;
  }

  /**
   * Desactiva múltiples historias médicas
   */
  async deleteMany(
    deleteMedicalHistoryDto: DeleteMedicalHistoryDto,
    user: UserData,
  ): Promise<BaseApiResponse<MedicalHistory[]>> {
    try {
      validateArray(deleteMedicalHistoryDto.ids, 'IDs de historias médicas');
      return await this.deleteMedicalHistoriesUseCase.execute(
        deleteMedicalHistoryDto,
        user,
      );
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
  ): Promise<BaseApiResponse<MedicalHistory[]>> {
    try {
      validateArray(ids, 'IDs de historias médicas');
      return await this.reactivateMedicalHistoryUseCase.execute(ids, user);
    } catch (error) {
      this.errorHandler.handleError(error, 'reactivating');
      throw error;
    }
  }

  /**
   * Obtiene una historia médica completa con sus actualizaciones e imágenes
   */
  async findOneComplete(id: string): Promise<
    BaseApiResponse<
      MedicalHistory & {
        updates: Record<
          string,
          {
            service: string;
            staff: string;
            branch: string;
            images: Array<{ id: string; url: string }>;
          }
        >;
      }
    >
  > {
    try {
      // Primero obtenemos la historia médica base
      const medicalHistory = await this.findById(id);

      if (!medicalHistory) {
        throw new BadRequestException('Historia médica no encontrada');
      }

      // Obtenemos las actualizaciones con imágenes
      const updatesWithImages =
        await this.medicalHistoryRepository.findOneWithUpdatesAndImages(
          medicalHistory.patientId,
        );

      return {
        success: true,
        message: 'Historia médica encontrada exitosamente',
        data: {
          ...medicalHistory,
          updates: updatesWithImages || {},
        },
      };
    } catch (error) {
      this.errorHandler.handleError(error, 'getting');
      throw error;
    }
  }
}
