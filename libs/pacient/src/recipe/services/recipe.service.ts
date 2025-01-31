import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrescriptionRepository } from '../repositories/recipe.repository';
import { Prescription } from '../entities/recipe.entity';
import {
  CreatePrescriptionDto,
  UpdatePrescriptionDto,
  DeletePrescriptionDto,
} from '../dto';
import { UserData } from '@login/login/interfaces';
import { validateArray, validateChanges } from '@prisma/prisma/utils';
import { BaseErrorHandler } from 'src/common/error-handlers/service-error.handler';
import { recipeErrorMessages } from '../errors/errors-recipe';
import {
  CreatePrescriptionUseCase,
  UpdatePrescriptionUseCase,
  DeletePrescriptionsUseCase,
  ReactivatePrescriptionUseCase,
} from '../use-cases';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';

// Constantes para nombres de tablas
const TABLE_NAMES = {
  UPDATE_HISTORIA: 'updateHistoria',
  SUCURSAL: 'sucursal',
  PERSONAL: 'personal',
  PACIENTE: 'paciente',
} as const;

@Injectable()
export class PrescriptionService {
  private readonly logger = new Logger(PrescriptionService.name);
  private readonly errorHandler: BaseErrorHandler;

  constructor(
    private readonly prescriptionRepository: PrescriptionRepository,
    private readonly createPrescriptionUseCase: CreatePrescriptionUseCase,
    private readonly updatePrescriptionUseCase: UpdatePrescriptionUseCase,
    private readonly deletePrescriptionsUseCase: DeletePrescriptionsUseCase,
    private readonly reactivatePrescriptionUseCase: ReactivatePrescriptionUseCase,
  ) {
    this.errorHandler = new BaseErrorHandler(
      this.logger,
      'Recipe',
      recipeErrorMessages,
    );
  }

  /**
   * Valida las referencias a otras tablas
   */
  private async validateReferences(
    dto: CreatePrescriptionDto | UpdatePrescriptionDto,
  ) {
    // Validar UpdateHistoria
    const updateHistoriaExists =
      await this.prescriptionRepository.findByIdValidate(
        TABLE_NAMES.UPDATE_HISTORIA,
        dto.updateHistoryId,
      );
    if (!updateHistoriaExists) {
      throw new BadRequestException(
        `Registro de Actualizacion de Historia Médica no encontrado`,
      );
    }

    // Validar Sucursal
    const sucursalExists = await this.prescriptionRepository.findByIdValidate(
      TABLE_NAMES.SUCURSAL,
      dto.branchId,
    );
    if (!sucursalExists) {
      throw new BadRequestException(`Registro de Sucursal no encontrado`);
    }

    // Validar Personal
    const personalExists = await this.prescriptionRepository.findByIdValidate(
      TABLE_NAMES.PERSONAL,
      dto.staffId,
    );
    if (!personalExists) {
      throw new BadRequestException(`Registro de Personal no encontrado`);
    }

    // Validar Paciente
    const pacienteExists = await this.prescriptionRepository.findByIdValidate(
      TABLE_NAMES.PACIENTE,
      dto.staffId,
    );
    if (!pacienteExists) {
      throw new BadRequestException(`Registro de Paciente no encontrado`);
    }
  }

  /**
   * Crea una nueva receta médica
   */
  async create(
    createPrescriptionDto: CreatePrescriptionDto,
    user: UserData,
  ): Promise<BaseApiResponse<Prescription>> {
    try {
      // Validar referencias antes de crear
      await this.validateReferences(createPrescriptionDto);
      return await this.createPrescriptionUseCase.execute(
        createPrescriptionDto,
        user,
      );
    } catch (error) {
      this.errorHandler.handleError(error, 'creating');
    }
  }

  /**
   * Actualiza una receta médica existente
   */
  async update(
    id: string,
    updatePrescriptionDto: UpdatePrescriptionDto,
    user: UserData,
  ): Promise<BaseApiResponse<Prescription>> {
    try {
      const currentPrescription = await this.findById(id);

      if (!validateChanges(updatePrescriptionDto, currentPrescription)) {
        return {
          success: true,
          message: 'No se detectaron cambios en la receta médica',
          data: currentPrescription,
        };
      }

      // Validar referencias antes de actualizar
      await this.validateReferences(updatePrescriptionDto);
      return await this.updatePrescriptionUseCase.execute(
        id,
        updatePrescriptionDto,
        user,
      );
    } catch (error) {
      this.errorHandler.handleError(error, 'updating');
      throw error;
    }
  }

  /**
   * Busca una receta médica por su ID
   */
  async findOne(id: string): Promise<Prescription> {
    try {
      return this.findById(id);
    } catch (error) {
      this.errorHandler.handleError(error, 'getting');
      throw error;
    }
  }

  /**
   * Obtiene todas las recetas médicas
   */
  async findAll(): Promise<Prescription[]> {
    try {
      return this.prescriptionRepository.findMany();
    } catch (error) {
      this.errorHandler.handleError(error, 'getting');
      throw error;
    }
  }

  /**
   * Busca una receta médica por su ID
   */
  async findById(id: string): Promise<Prescription> {
    const prescription = await this.prescriptionRepository.findById(id);
    if (!prescription) {
      throw new BadRequestException('Receta médica no encontrada');
    }
    return prescription;
  }

  /**
   * Desactiva múltiples recetas médicas
   */
  async deleteMany(
    deletePrescriptionDto: DeletePrescriptionDto,
    user: UserData,
  ): Promise<BaseApiResponse<Prescription[]>> {
    try {
      validateArray(deletePrescriptionDto.ids, 'IDs de recetas médicas');
      return await this.deletePrescriptionsUseCase.execute(
        deletePrescriptionDto,
        user,
      );
    } catch (error) {
      this.errorHandler.handleError(error, 'deactivating');
      throw error;
    }
  }

  /**
   * Reactiva múltiples recetas médicas
   */
  async reactivateMany(
    ids: string[],
    user: UserData,
  ): Promise<BaseApiResponse<Prescription[]>> {
    try {
      validateArray(ids, 'IDs de recetas médicas');
      return await this.reactivatePrescriptionUseCase.execute(ids, user);
    } catch (error) {
      this.errorHandler.handleError(error, 'reactivating');
      throw error;
    }
  }

  async findByConsultaId(consultaId: string): Promise<Prescription> {
    try {
      const prescription =
        await this.prescriptionRepository.findById(consultaId);
      if (!prescription) {
        throw new NotFoundException('Receta no encontrada para esta consulta');
      }
      return prescription;
    } catch (error) {
      this.errorHandler.handleError(error, 'getting');
    }
  }
}
