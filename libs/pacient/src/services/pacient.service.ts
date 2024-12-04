import {
  BadRequestException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { PacientRepository } from '../repositories/pacient.repository';
import { Paciente } from '../entities/pacient.entity';
import { CreatePacienteDto } from '../dto/create-pacient.dto';
import { UpdatePacientDto } from '../dto/update-pacient.dto';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { validateChanges } from '@prisma/prisma/utils';
import { CreatePacientUseCase } from '../use-cases/create-pacient.use-case';
import { UpdatePacientUseCase } from '../use-cases/update-pacient.use-case';
import { BaseErrorHandler } from 'src/common/error-handlers/service-error.handler';
import { pacientErrorMessages } from '../errors/errors-pacient';

@Injectable()
export class PacientService {
  private readonly logger = new Logger(PacientService.name);
  private readonly errorHandler: BaseErrorHandler;

  constructor(
    private readonly pacientRepository: PacientRepository,
    private readonly createPacientUseCase: CreatePacientUseCase,
    private readonly updatePacientUseCase: UpdatePacientUseCase,
  ) {
    this.errorHandler = new BaseErrorHandler(
      this.logger,
      'Pacient',
      pacientErrorMessages,
    );
  }

  async create(
    createPacienteDto: CreatePacienteDto,
    user: UserData,
  ): Promise<HttpResponse<Paciente>> {
    try {
      return await this.createPacientUseCase.execute(createPacienteDto, user);
    } catch (error) {
      this.errorHandler.handleError(error, 'creating');
    }
  }

  async update(
    id: string,
    updatePacientDto: UpdatePacientDto,
    user: UserData,
  ): Promise<HttpResponse<Paciente>> {
    try {
      const currentPacient = await this.findById(id);

      if (!validateChanges(updatePacientDto, currentPacient)) {
        return {
          statusCode: HttpStatus.OK,
          message: 'No se detectaron cambios en el paciente',
          data: currentPacient,
        };
      }

      return await this.updatePacientUseCase.execute(
        id,
        updatePacientDto,
        user,
      );
    } catch (error) {
      this.errorHandler.handleError(error, 'updating');
    }
  }

  async findAll(): Promise<Paciente[]> {
    try {
      return this.pacientRepository.findMany();
    } catch (error) {
      this.errorHandler.handleError(error, 'getting');
    }
  }

  async findById(id: string): Promise<Paciente> {
    const paciente = await this.pacientRepository.findById(id);
    if (!paciente) {
      throw new BadRequestException('Paciente no encontrado');
    }
    return paciente;
  }
}
