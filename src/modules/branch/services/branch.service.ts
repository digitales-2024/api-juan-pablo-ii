import {
  BadRequestException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { BranchRepository } from '../repositories/branch.repository';
import { Branch } from '../entities/branch.entity';
import {
  BaseErrorHandler,
  branchErrorMessages,
} from 'src/common/error-handlers/service-error.handler';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { validateArray, validateChanges } from '@prisma/prisma/utils';
import { CreateBranchDto, UpdateBranchDto, DeleteBranchesDto } from '../dto';
import {
  CreateBranchUseCase,
  UpdateBranchUseCase,
  DeleteBranchesUseCase,
  ReactivateBranchesUseCase,
} from '../use-cases';

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

  async create(
    createBranchDto: CreateBranchDto,
    user: UserData,
  ): Promise<HttpResponse<Branch>> {
    try {
      return await this.createBranchUseCase.execute(createBranchDto, user);
    } catch (error) {
      this.errorHandler.handleError(error, 'creating');
    }
  }

  async update(
    id: string,
    updateBranchDto: UpdateBranchDto,
    user: UserData,
  ): Promise<HttpResponse<Branch>> {
    try {
      const currentBranch = await this.branchRepository.findById(id);

      if (!validateChanges(updateBranchDto, currentBranch)) {
        return {
          statusCode: HttpStatus.OK,
          message: 'No se detectaron cambios en la sucursal',
          data: currentBranch,
        };
      }

      return await this.updateBranchUseCase.execute(id, updateBranchDto, user);
    } catch (error) {
      this.errorHandler.handleError(error, 'updating');
    }
  }

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
  ): Promise<HttpResponse<Branch[]>> {
    try {
      // Validar el array de IDs
      validateArray(deleteBranchesDto.ids, 'IDs de sucursales');

      return await this.deleteBranchesUseCase.execute(deleteBranchesDto, user);
    } catch (error) {
      this.errorHandler.handleError(error, 'deactivating');
    }
  }

  async findOne(id: string): Promise<Branch> {
    try {
      return this.findById(id);
    } catch (error) {
      this.errorHandler.handleError(error, 'getting');
    }
  }

  async reactivateMany(
    ids: string[],
    user: UserData,
  ): Promise<HttpResponse<Branch[]>> {
    try {
      // Validar el array de IDs
      validateArray(ids, 'IDs de sucursales');

      return await this.reactivateBranchesUseCase.execute(ids, user);
    } catch (error) {
      this.errorHandler.handleError(error, 'reactivating');
    }
  }
  //
  // async deleteMany(
  //   ids: string[],
  //   user: UserData,
  // ): Promise<HttpResponse<Branch[]>> {
  //   try {
  //     validateArray(ids, 'IDs de sucursales');
  //     // Implementation
  //   } catch (error) {
  //     this.errorHandler.handleError(error, 'deactivating');
  //   }
  // }
  //
  // async reactivateMany(
  //   ids: string[],
  //   user: UserData,
  // ): Promise<HttpResponse<Branch[]>> {
  //   try {
  //     validateArray(ids, 'IDs de sucursales');
  //     // Implementation
  //   } catch (error) {
  //     this.errorHandler.handleError(error, 'reactivating');
  //   }
  // }

  /**
   * Busca una Sucursal por su ID (método interno)
   * @param id - ID del servicio a buscar
   * @returns Sucursal no encontrado
   * @throws {BadRequestException} Si la sucursal no existe
   * @internal
   */
  async findById(id: string): Promise<Branch> {
    const branch = await this.branchRepository.findById(id);
    if (!branch) {
      throw new BadRequestException(`Sucursal no encontrado`);
    }
    return branch;
  }
}
