import {
  BadRequestException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { validateChanges } from '@prisma/prisma/utils';
import { BaseErrorHandler } from 'src/common/error-handlers/service-error.handler';

import { especialidadErrorMessages } from '../errors/erros-staff';
import {
  CreateSpecializationUseCase,
  UpdateSpecializationUseCase,
} from '../use-cases';
import { CreateSpecializationDto, UpdateSpecializationDto } from '../dto';
import { Specialization } from '../entities/staff.entity';
import { SpecializationRepository } from '../repositories/specialization.repository';

/**
 * Servicio que implementa la lógica de negocio para especialidades médicas.
 * Utiliza EspecialidadRepository para acceder a la base de datos y varios casos de uso
 * para implementar las operaciones principales.
 */
@Injectable()
export class SpecializationService {
  private readonly logger = new Logger(SpecializationService.name);
  private readonly errorHandler: BaseErrorHandler;

  constructor(
    private readonly specializationRepository: SpecializationRepository,
    private readonly createSpecializationUseCase: CreateSpecializationUseCase,
    private readonly updateSpecializationUseCase: UpdateSpecializationUseCase,
  ) {
    this.errorHandler = new BaseErrorHandler(
      this.logger,
      'Especialidad',
      especialidadErrorMessages,
    );
  }

  /**
   * Crea una nueva especialidad médica
   * @param createEspecialidadDto - DTO con los datos de la especialidad a crear
   * @param user - Datos del usuario que realiza la operación
   * @returns Respuesta HTTP con la especialidad creada
   * @throws {BadRequestException} Si ya existe la especialidad
   */
  async create(
    createEspecialidadDto: CreateSpecializationDto,
    user: UserData,
  ): Promise<HttpResponse<Specialization>> {
    try {
      return await this.createSpecializationUseCase.execute(
        createEspecialidadDto,
        user,
      );
    } catch (error) {
      this.errorHandler.handleError(error, 'creating');
    }
  }

  /**
   * Actualiza una especialidad existente
   * @param id - ID de la especialidad a actualizar
   * @param updateEspecialidadDto - DTO con los datos a actualizar
   * @param user - Datos del usuario que realiza la operación
   * @returns Respuesta HTTP con la especialidad actualizada
   * @throws {NotFoundException} Si la especialidad no existe
   */
  async update(
    id: string,
    updateEspecialidadDto: UpdateSpecializationDto,
    user: UserData,
  ): Promise<HttpResponse<Specialization>> {
    try {
      const currentEspecialidad = await this.findById(id);

      if (!validateChanges(updateEspecialidadDto, currentEspecialidad)) {
        return {
          statusCode: HttpStatus.OK,
          message: 'No se detectaron cambios en la especialidad',
          data: currentEspecialidad,
        };
      }

      return await this.updateSpecializationUseCase.execute(
        id,
        updateEspecialidadDto,
        user,
      );
    } catch (error) {
      this.errorHandler.handleError(error, 'updating');
    }
  }

  /**
   * Obtiene todas las especialidades
   * @returns Lista de todas las especialidades
   */
  async findAll(): Promise<Specialization[]> {
    try {
      return this.specializationRepository.findMany();
    } catch (error) {
      this.errorHandler.handleError(error, 'getting');
    }
  }

  /**
   * Busca una especialidad por su ID
   * @param id - ID de la especialidad a buscar
   * @returns Especialidad encontrada
   * @throws {NotFoundException} Si la especialidad no existe
   */
  async findOne(id: string): Promise<Specialization> {
    try {
      return this.findById(id);
    } catch (error) {
      this.errorHandler.handleError(error, 'getting');
    }
  }

  /**
   * Busca una especialidad por su ID (método interno)
   * @param id - ID de la especialidad a buscar
   * @returns Especialidad encontrada
   * @throws {BadRequestException} Si la especialidad no existe
   * @internal
   */
  async findById(id: string): Promise<Specialization> {
    const especialidad = await this.specializationRepository.findById(id);
    if (!especialidad) {
      throw new BadRequestException('Especialidad no encontrada');
    }
    return especialidad;
  }
}
