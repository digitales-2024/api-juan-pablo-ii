import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { UserData } from '@login/login/interfaces';
import { validateArray, validateChanges } from '@prisma/prisma/utils';
import { BaseErrorHandler } from 'src/common/error-handlers/service-error.handler';
import { Staff } from '../entities/staff.entity';
import { StaffRepository } from '../repositories/staff.repository';
import {
  CreateStaffUseCase,
  DeleteStaffUseCase,
  ReactivateStaffUseCase,
  UpdateStaffUseCase,
} from '../use-cases';
import { CreateStaffDto, DeleteStaffDto, UpdateStaffDto } from '../dto';
import { staffErrorMessages } from '../errors/erros-staff';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';

/**
 * Servicio que implementa la lógica de negocio para personal médico.
 * @class
 * @description Utiliza StaffRepository para acceder a la base de datos y varios casos de uso
 * para implementar las operaciones principales como crear, actualizar, eliminar y reactivar personal.
 */
@Injectable()
export class StaffService {
  private readonly logger = new Logger(StaffService.name);
  private readonly errorHandler: BaseErrorHandler;

  constructor(
    private readonly staffRepository: StaffRepository,
    private readonly createStaffUseCase: CreateStaffUseCase,
    private readonly updateStaffUseCase: UpdateStaffUseCase,
    private readonly deleteStaffUseCase: DeleteStaffUseCase,
    private readonly reactiveStaffUseCase: ReactivateStaffUseCase,
  ) {
    this.errorHandler = new BaseErrorHandler(
      this.logger,
      'Personal',
      staffErrorMessages,
    );
  }

  /**
   * Crea un nuevo personal
   * @param createStaffDto - DTO con los datos del personal a crear
   * @param user - Datos del usuario que realiza la operación
   * @returns Respuesta HTTP con el personal creado
   * @throws {BadRequestException} Si ya existe el personal
   */
  async create(
    createStaffDto: CreateStaffDto,
    user: UserData,
  ): Promise<BaseApiResponse<Staff>> {
    try {
      return await this.createStaffUseCase.execute(createStaffDto, user);
    } catch (error) {
      this.errorHandler.handleError(error, 'creating');
    }
  }

  /**
   * Actualiza un personal existente
   * @param id - ID del personal a actualizar
   * @param updateStaffDto - DTO con los datos a actualizar
   * @param user - Datos del usuario que realiza la operación
   * @returns Respuesta HTTP con el personal actualizado
   * @throws {NotFoundException} Si el personal no existe
   */
  async update(
    id: string,
    updateStaffDto: UpdateStaffDto,
    user: UserData,
  ): Promise<BaseApiResponse<Staff>> {
    try {
      const currentPersonal = await this.findById(id);

      if (!validateChanges(updateStaffDto, currentPersonal)) {
        return {
          success: true,
          message: 'No se detectaron cambios en el personal',
          data: currentPersonal,
        };
      }

      return await this.updateStaffUseCase.execute(id, updateStaffDto, user);
    } catch (error) {
      this.errorHandler.handleError(error, 'updating');
    }
  }

  /**
   * Obtiene todos los registros de personal
   * @returns Lista de todo el personal
   */
  async findAll(): Promise<Staff[]> {
    try {
      return await this.staffRepository.findMany();
    } catch (error) {
      this.errorHandler.handleError(error, 'getting');
    }
  }

  /**
   * Obtiene todos los registros de personal activo
   * @returns Lista de todo el personal
   */
  async findAllActive(): Promise<Staff[]> {
    try {
      return await this.staffRepository.findManyActive();
    } catch (error) {
      this.errorHandler.handleError(error, 'getting');
    }
  }

  /**
   * Busca un personal por su ID
   * @param id - ID del personal a buscar
   * @returns Personal encontrado
   * @throws {NotFoundException} Si el personal no existe
   */
  async findOne(id: string): Promise<Staff> {
    try {
      return this.findById(id);
    } catch (error) {
      this.errorHandler.handleError(error, 'getting');
    }
  }

  /**
   * Elimina múltiples personales
   * @param deleteStaffDto - DTO con los IDs de los personales a eliminar
   * @param user - Datos del usuario que realiza la operación
   * @returns Respuesta HTTP con los personales eliminados
   * @throws {NotFoundException} Si alguno personal no existe
   */
  async deleteMany(
    deleteStaffDto: DeleteStaffDto,
    user: UserData,
  ): Promise<BaseApiResponse<Staff[]>> {
    try {
      // Validar el array de IDs
      validateArray(deleteStaffDto.ids, 'IDs de personal');

      return await this.deleteStaffUseCase.execute(deleteStaffDto, user);
    } catch (error) {
      this.errorHandler.handleError(error, 'deleting');
    }
  }

  /**
   * Reactiva múltiples personales
   * @param ids - Lista de IDs de los personales a reactivar
   * @param user - Datos del usuario que realiza la operación
   * @returns Respuesta HTTP con los personales reactivados
   * @throws {NotFoundException} Si alguno personal no existe
   */
  async reactivateMany(
    ids: string[],
    user: UserData,
  ): Promise<BaseApiResponse<Staff[]>> {
    try {
      // Validar el array de IDs
      validateArray(ids, 'IDs de personal');

      return await this.reactiveStaffUseCase.execute(ids, user);
    } catch (error) {
      this.errorHandler.handleError(error, 'reactivating');
    }
  }

  /**
   * Busca un personal por su ID (método interno)
   * @param id - ID del personal a buscar
   * @returns Personal encontrado
   * @throws {BadRequestException} Si el personal no existe
   * @internal
   */
  async findById(id: string): Promise<Staff> {
    const staff = await this.staffRepository.findById(id);
    if (!staff) {
      throw new BadRequestException('Personal no encontrado');
    }
    return staff;
  }
}
