import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ApponitmentUserRepository } from '../repositories/apponitment-user.repository';
import { AppointmentMedicalResponse } from '../entities/apponitment-user..entity';
import { UpdateAppointmentUserDto } from '../dto';
import { UserData } from '@login/login/interfaces';
import { BaseErrorHandler } from 'src/common/error-handlers/service-error.handler';
import { recipeErrorMessages } from '../errors/errors-apponitment-user';
import { UpdateApponitmentUserUseCase } from '../use-cases';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';

@Injectable()
export class ApponitmentUserService {
  private readonly logger = new Logger(ApponitmentUserService.name);
  private readonly errorHandler: BaseErrorHandler;

  constructor(
    private readonly apponitmentUserRepository: ApponitmentUserRepository,

    private readonly updateApponitmentUserUseCase: UpdateApponitmentUserUseCase,
  ) {
    this.errorHandler = new BaseErrorHandler(
      this.logger,
      'Recipe',
      recipeErrorMessages,
    );
  }

  /**
   * Actualiza una receta médica existente
   */
  async update(
    id: string,
    updateAppointmentUserDto: UpdateAppointmentUserDto,
    user: UserData,
  ): Promise<BaseApiResponse<AppointmentMedicalResponse>> {
    try {
      return await this.updateApponitmentUserUseCase.execute(
        id,
        updateAppointmentUserDto,
        user,
      );
    } catch (error) {
      this.errorHandler.handleError(error, 'updating');
      throw error;
    }
  }

  /**
   * Obtiene todas las recetas médicas
   */
  async findAll(): Promise<AppointmentMedicalResponse[]> {
    try {
      return this.apponitmentUserRepository.findMany();
    } catch (error) {
      this.errorHandler.handleError(error, 'getting');
      throw error;
    }
  }

  /**
   * Busca una receta médica por su ID
   */
  async findById(id: string): Promise<AppointmentMedicalResponse> {
    const prescription = await this.apponitmentUserRepository.findById(id);
    if (!prescription) {
      throw new BadRequestException('Receta médica no encontrada');
    }
    return prescription;
  }
}
