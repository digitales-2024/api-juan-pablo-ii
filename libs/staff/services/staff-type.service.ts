import {
  Injectable,
  Logger,
} from '@nestjs/common';
import { UserData } from '@login/login/interfaces';
import { validateArray, validateChanges } from '@prisma/prisma/utils';
import { BaseErrorHandler } from 'src/common/error-handlers/service-error.handler';

import { staffTypeErrorMessages } from '../errors/erros-staff';
import {
  CreateStaffTypeUseCase,
  UpdateStaffTypeUseCase,
  DeleteStaffTypeUseCase,
  ReactivateStaffTypeUseCase,
} from '../use-cases';
import {
  CreateStaffTypeDto,
  DeleteStaffTypeDto,
  UpdateStaffTypeDto,
} from '../dto';
import { StaffTypeRepository } from '../repositories/staff-type.repository';
import { StaffType } from '../entities/staff.entity';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';
/**
 * Servicio que implementa la lógica de negocio para tipos de personal.
 * @class
 * @description Utiliza StaffTypeRepository para acceder a la base de datos y varios casos de uso
 * para implementar las operaciones principales como crear, actualizar, eliminar y reactivar tipos de personal.
 */
@Injectable()
export class StaffTypeService {
  private readonly logger = new Logger(StaffTypeService.name);
  private readonly errorHandler: BaseErrorHandler;

  constructor(
    private readonly StaffTypeRepository: StaffTypeRepository,
    private readonly CreateStaffTypeUseCase: CreateStaffTypeUseCase,
    private readonly updateStaffTypeUseCase: UpdateStaffTypeUseCase,
    private readonly deleteStaffTypeUseCase: DeleteStaffTypeUseCase,
    private readonly reactiveStaffTypeUseCase: ReactivateStaffTypeUseCase,
  ) {
    this.errorHandler = new BaseErrorHandler(
      this.logger,
      'Tipo de personal',
      staffTypeErrorMessages,
    );
  }

  /**
   * Crea un nuevo tipo de personal
   * @param createStaffTypeDto - DTO con los datos del tipo de personal a crear
   * @param user - Datos del usuario que realiza la operación
   * @returns Respuesta HTTP con el tipo de personal creado
   * @throws {BadRequestException} Si ya existe el tipo de personal
   */
  async create(
    createStaffTypeDto: CreateStaffTypeDto,
    user: UserData,
  ): Promise<BaseApiResponse<StaffType>> {
    try {
      return await this.CreateStaffTypeUseCase.execute(
        createStaffTypeDto,
        user,
      );
    } catch (error) {
      this.errorHandler.handleError(error, 'creating');
    }
  }

  /**
   * Actualiza un tipo de personal existente
   * @param id - ID del tipo de personal a actualizar
   * @param updateStaffTypeDto - DTO con los datos del tipo de personal a actualizar
   * @param user - Datos del usuario que realiza la operación
   * @returns Respuesta HTTP con el tipo de personal actualizado
   * @throws {BadRequestException} Si no se detectaron cambios en el tipo de personal
   */
  async update(
    id: string,
    updateStaffTypeDto: UpdateStaffTypeDto,
    user: UserData,
  ): Promise<BaseApiResponse<StaffType>> {
    try {
      const currentStaffType = await this.findById(id);

      if (!validateChanges(updateStaffTypeDto, currentStaffType)) {
        return {
          success: true,
          message: 'No se detectaron cambios en el tipo de personal',
          data: currentStaffType,
        };
      }

      return await this.updateStaffTypeUseCase.execute(
        id,
        updateStaffTypeDto,
        user,
      );
    } catch (error) {
      this.errorHandler.handleError(error, 'updating');
    }
  }

  /**
   * Obtiene todos los tipos de personal
   * @returns Lista de todos los tipos de personal
   */
  async findAll(): Promise<StaffType[]> {
    try {
      return this.StaffTypeRepository.findMany();
    } catch (error) {
      this.errorHandler.handleError(error, 'getting');
    }
  }

  /**
   * Busca un tipo de personal por su ID
   * @param id - ID del tipo de personal a buscar
   * @returns Tipo de personal encontrado
   * @throws {NotFoundException} Si el tipo de personal no existe
   */
  async findOne(id: string): Promise<StaffType> {
    try {
      return this.findById(id);
    } catch (error) {
      this.errorHandler.handleError(error, 'getting');
    }
  }

  /**
   * Elimina múltiples tipos de personal
   * @param DeleteStaffTypeDto - DTO con los IDs de los tipos de personal a eliminar
   * @param user - Datos del usuario que realiza la operación
   * @returns Respuesta HTTP con los tipos de personal eliminados
   * @throws {NotFoundException} Si alguno de los tipos de personal no existe
   */
  async deleteMany(
    DeleteStaffTypeDto: DeleteStaffTypeDto,
    user: UserData,
  ): Promise<BaseApiResponse<StaffType[]>> {
    try {
      // Validar el array de IDs
      validateArray(DeleteStaffTypeDto.ids, 'IDs de tipos de personal');

      return await this.deleteStaffTypeUseCase.execute(
        DeleteStaffTypeDto,
        user,
      );
    } catch (error) {
      this.errorHandler.handleError(error, 'deleting');
    }
  }

  /**
   * Reactiva múltiples tipos de personal
   * @param ids - Lista de IDs de los tipos de personal a reactivar
   * @param user - Datos del usuario que realiza la operación
   * @returns Respuesta HTTP con los tipos de personal reactivados
   * @throws {NotFoundException} Si alguno de los tipos de personal no existe
   */
  async reactivateMany(
    ids: string[],
    user: UserData,
  ): Promise<BaseApiResponse<StaffType[]>> {
    try {
      // Validar el array de IDs
      validateArray(ids, 'IDs de tipos de personal');

      return await this.reactiveStaffTypeUseCase.execute(ids, user);
    } catch (error) {
      this.errorHandler.handleError(error, 'reactivating');
    }
  }

  /**
   * Busca un tipo de personal por su ID (método interno)
   * @param id - ID del tipo de personal a buscar
   * @returns Tipo de personal encontrado
   * @throws {BadRequestException} Si el tipo de personal no existe
   * @internal
   */
  async findById(id: string): Promise<StaffType> {
    const staffType = await this.StaffTypeRepository.findById(id);

    return staffType;
  }
}
