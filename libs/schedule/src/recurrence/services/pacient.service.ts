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
import { validateArray, validateChanges } from '@prisma/prisma/utils';
import { CreatePacientUseCase } from '../use-cases/create-pacient.use-case';
import { UpdatePacientUseCase } from '../use-cases/update-pacient.use-case';
import { BaseErrorHandler } from 'src/common/error-handlers/service-error.handler';
import { pacientErrorMessages } from '../errors/errors-pacient';
import { DeletePacientDto } from '../dto';
import { DeletePacientsUseCase, ReactivatePacientUseCase } from '../use-cases';

@Injectable()
export class PacientService {
  private readonly logger = new Logger(PacientService.name);
  private readonly errorHandler: BaseErrorHandler;

  constructor(
    private readonly pacientRepository: PacientRepository,
    private readonly createPacientUseCase: CreatePacientUseCase,
    private readonly updatePacientUseCase: UpdatePacientUseCase,
    private readonly deletePacientsUseCase: DeletePacientsUseCase,
    private readonly reactivatePacientUseCase: ReactivatePacientUseCase,
  ) {
    this.errorHandler = new BaseErrorHandler(
      this.logger,
      'Pacient',
      pacientErrorMessages,
    );
  }

  /**
   * Crea un nuevo paciente
   * @param createPacienteDto - DTO con los datos para crear el paciente
   * @param user - Datos del usuario que realiza la creación
   * @returns Una promesa que resuelve con la respuesta HTTP que contiene el paciente creado
   * @throws {BadRequestException} Si ya existe un paciente con el DNI proporcionado
   * @throws {Error} Si ocurre un error al crear el paciente
   */
  async create(
    createPacienteDto: CreatePacienteDto,
    user: UserData,
  ): Promise<HttpResponse<Paciente>> {
    try {
      // Validar si el DNI ya existe
      const dniExists = await this.validateDNIExists(createPacienteDto.dni);
      if (dniExists) {
        throw new BadRequestException('Ya existe un paciente con este DNI');
      }
      return await this.createPacientUseCase.execute(createPacienteDto, user);
    } catch (error) {
      this.errorHandler.handleError(error, 'creating');
    }
  }

  /**
   * Actualiza un paciente existente
   * @param id - ID del paciente a actualizar
   * @param updatePacientDto - DTO con los datos para actualizar el paciente
   * @param user - Datos del usuario que realiza la actualización
   * @returns Una promesa que resuelve con la respuesta HTTP que contiene el paciente actualizado
   * @throws {Error} Si ocurre un error al actualizar el paciente
   */
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

  /**
   * Busca un paciente por su ID
   * @param id - ID del paciente a buscar
   * @returns El paciente encontrado
   * @throws {NotFoundException} Si el paciente no existe
   */
  async findOne(id: string): Promise<Paciente> {
    try {
      return this.findById(id);
    } catch (error) {
      this.errorHandler.handleError(error, 'getting');
    }
  }

  /**
   * Obtiene todos los pacientes
   * @returns Una promesa que resuelve con una lista de todos los pacientes
   * @throws {Error} Si ocurre un error al obtener los pacientes
   */
  async findAll(): Promise<Paciente[]> {
    try {
      return this.pacientRepository.findMany();
    } catch (error) {
      this.errorHandler.handleError(error, 'getting');
    }
  }

  /**
   * Busca un paciente por su ID
   * @param id - ID del paciente a buscar
   * @returns Una promesa que resuelve con el paciente encontrado
   * @throws {BadRequestException} Si el paciente no existe
   */
  async findById(id: string): Promise<Paciente> {
    const paciente = await this.pacientRepository.findById(id);
    if (!paciente) {
      throw new BadRequestException('Paciente no encontrado');
    }
    return paciente;
  }

  /**
   * Valida si un DNI ya está registrado
   * @param dni - DNI a validar
   * @returns true si el DNI ya está registrado, false si no
   */
  async validateDNIExists(dni: string): Promise<boolean> {
    const existingPacients = await this.pacientRepository.findByDNI(dni);
    // Devuelve true si hay pacientes con el DNI proporcionado, false si no
    return existingPacients.length > 0;
  }

  /**
   * Desactiva múltiples pacientes
   * @param deletePacientDto - DTO con los IDs de los pacientes a desactivar
   * @param user - Datos del usuario que realiza la operación
   * @returns Respuesta HTTP con los pacientes desactivados
   * @throws {NotFoundException} Si algún paciente no existe
   */
  async deleteMany(
    deletePacientDto: DeletePacientDto,
    user: UserData,
  ): Promise<HttpResponse<Paciente[]>> {
    try {
      // Validar el array de IDs
      validateArray(deletePacientDto.ids, 'IDs de pacientes');

      return await this.deletePacientsUseCase.execute(deletePacientDto, user);
    } catch (error) {
      this.errorHandler.handleError(error, 'deactivating');
    }
  }

  /**
   * Reactiva múltiples pacientes
   * @param ids - Lista de IDs de los pacientes a reactivar
   * @param user - Datos del usuario que realiza la operación
   * @returns Respuesta HTTP con los pacientes reactivados
   * @throws {NotFoundException} Si algún paciente no existe
   */
  async reactivateMany(
    ids: string[],
    user: UserData,
  ): Promise<HttpResponse<Paciente[]>> {
    try {
      // Validar el array de IDs
      validateArray(ids, 'IDs de pacientes');

      return await this.reactivatePacientUseCase.execute(ids, user);
    } catch (error) {
      this.errorHandler.handleError(error, 'reactivating');
    }
  }
}
