import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { BranchRepository } from '../repositories/branch.repository';
import { Branch } from '../entities/branch.entity';
import { CreateBranchDto } from '../dto/create-branch.dto';
import { UpdateBranchDto } from '../dto/update-branch.dto';
import {
  BaseErrorHandler,
  branchErrorMessages,
} from 'src/common/error-handlers/service-error.handler';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { validateChanges } from '@prisma/prisma/utils';
import { CreateBranchUseCase } from '../use-cases/create-branch.use-case';
import { UpdateBranchUseCase } from '../use-cases/update-branch.use-case';

@Injectable()
export class BranchService {
  private readonly logger = new Logger(BranchService.name);
  private readonly errorHandler: BaseErrorHandler;

  constructor(
    private readonly branchRepository: BranchRepository,
    private readonly createBranchUseCase: CreateBranchUseCase,
    private readonly updateBranchUseCase: UpdateBranchUseCase,
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

  // async findOne(id: string): Promise<Branch> {
  //   try {
  //     return this.findById(id);
  //   } catch (error) {
  //     this.errorHandler.handleError(error, 'getting');
  //   }
  // }
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
  //
  // private async findById(id: string): Promise<Branch> {
  //   // Implementation
  // }
}
