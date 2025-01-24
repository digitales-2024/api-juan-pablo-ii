import { Injectable, Logger } from '@nestjs/common';
import { BranchRepository } from '../repositories/branch.repository';
import { Branch } from '../entities/branch.entity';
import { BaseErrorHandler } from 'src/common/error-handlers/service-error.handler';
import { UserData } from '@login/login/interfaces';
import { validateArray, validateChanges } from '@prisma/prisma/utils';
import { CreateBranchDto, UpdateBranchDto, DeleteBranchesDto } from '../dto';
import {
  CreateBranchUseCase,
  UpdateBranchUseCase,
  DeleteBranchesUseCase,
  ReactivateBranchesUseCase,
} from '../use-cases';
import { branchErrorMessages } from '../errors/errors-branch';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';

/**
 * Servicio que implementa la lógica de negocio para sucursales.
 * Utiliza BranchRepository para acceder a la base de datos y varios casos de uso
 * para implementar las operaciones principales.
 *
 * @remarks
 * Este servicio maneja las operaciones CRUD sobre sucursales y utiliza
 * casos de uso específicos para cada operación principal.
 */

@Injectable()
export class BranchService {
  private readonly logger = new Logger(BranchService.name);
  private readonly errorHandler: BaseErrorHandler;

  constructor(
    private readonly branchRepository: BranchRepository,
    private readonly createBranchUseCase: CreateBranchUseCase,
    private readonly updateBranchUseCase: UpdateBranchUseCase,
    private readonly deleteBranchesUseCase: DeleteBranchesUseCase,
    private readonly reactivateBranchesUseCase: ReactivateBranchesUseCase,
  ) {
    this.errorHandler = new BaseErrorHandler(
      this.logger,
      'Sucursal',
      branchErrorMessages,
    );
  }
  /**
   * Crea una nueva sucursal
   * @param createBranchDto - DTO con los datos de la sucursal a crear
   * @param user - Datos del usuario que realiza la operación
   * @returns Respuesta HTTP con la sucursal creada
   * @throws {BadRequestException} Si la sucursal ya existe
   */
  async create(
    createBranchDto: CreateBranchDto,
    user: UserData,
  ): Promise<BaseApiResponse<Branch>> {
    try {
      return await this.createBranchUseCase.execute(createBranchDto, user);
    } catch (error) {
      this.errorHandler.handleError(error, 'creating');
    }
  }

  /**
   * Actualiza una sucursal existente
   * @param id - ID de la sucursal a actualizar
   * @param updateBranchDto - DTO con los datos a actualizar
   * @param user - Datos del usuario que realiza la operación
   * @returns Respuesta HTTP con la sucursal actualizada
   * @throws {NotFoundException} Si la sucursal no existe
   */
  async update(
    id: string,
    updateBranchDto: UpdateBranchDto,
    user: UserData,
  ): Promise<BaseApiResponse<Branch>> {
    try {
      const currentBranch = await this.branchRepository.findBranchById(id);

      if (!validateChanges(updateBranchDto, currentBranch)) {
        return {
          success: true,
          // statusCode: HttpStatus.OK,
          message: 'Sucursal actualizada exitosamente',
          data: currentBranch,
        };
      }

      return await this.updateBranchUseCase.execute(id, updateBranchDto, user);
    } catch (error) {
      this.errorHandler.handleError(error, 'updating');
    }
  }

  /**
   * Obtiene todas las sucursales
   * @returns Lista de todas las sucursales
   */
  async findAll(): Promise<Branch[]> {
    try {
      return this.branchRepository.findMany();
    } catch (error) {
      this.errorHandler.handleError(error, 'getting');
    }
  }
  /**
   * Desactiva múltiples sucursales
   * @param deleteBranchesDto - DTO con los IDs de las sucursales a desactivar
   * @param user - Datos del usuario que realiza la operación
   * @returns Respuesta HTTP con las sucursales desactivadas
   * @throws {NotFoundException} Si alguna sucursal no existe
   */
  async deleteMany(
    deleteBranchesDto: DeleteBranchesDto,
    user: UserData,
  ): Promise<BaseApiResponse<Branch[]>> {
    try {
      // Validar el array de IDs
      validateArray(deleteBranchesDto.ids, 'IDs de sucursales');

      return await this.deleteBranchesUseCase.execute(deleteBranchesDto, user);
    } catch (error) {
      this.errorHandler.handleError(error, 'deactivating');
    }
  }

  /**
   * Busca una sucursal por su ID
   * @param id - ID de la sucursal a buscar
   * @returns La sucursal encontrada
   * @throws {NotFoundException} Si la sucursal no existe
   */
  async findOne(id: string): Promise<Branch> {
    try {
      return this.branchRepository.findBranchById(id);
    } catch (error) {
      this.errorHandler.handleError(error, 'getting');
    }
  }

  /**
   * Reactiva múltiples sucursales
   * @param ids - Lista de IDs de las sucursales a reactivar
   * @param user - Datos del usuario que realiza la operación
   * @returns Respuesta HTTP con las sucursales reactivadas
   * @throws {NotFoundException} Si alguna sucursal no existe
   */
  async reactivateMany(
    ids: string[],
    user: UserData,
  ): Promise<BaseApiResponse<Branch[]>> {
    try {
      // Validar el array de IDs
      validateArray(ids, 'IDs de sucursales');

      return await this.reactivateBranchesUseCase.execute(ids, user);
    } catch (error) {
      this.errorHandler.handleError(error, 'reactivating');
    }
  }
}
