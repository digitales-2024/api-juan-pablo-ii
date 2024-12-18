import {
  BadRequestException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { IncomingRepository } from '../repositories/incoming.repository';
import { Incoming } from '../entities/incoming.entity';
import { CreateIncomingDto } from '../dto/create-incoming.dto';
import { UpdateIncomingDto } from '../dto/update-incoming.dto';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { validateArray, validateChanges } from '@prisma/prisma/utils';
import { CreateIncomingUseCase } from '../use-cases/create-incoming.use-case';
import { UpdateIncomingUseCase } from '../use-cases/update-incoming.use-case';
import { BaseErrorHandler } from 'src/common/error-handlers/service-error.handler';
import { incomingErrorMessages } from '../errors/errors-incoming';
import { DeleteIncomingDto } from '../dto';
import { DeleteIncomingUseCase, ReactivateIncomingUseCase } from '../use-cases';

@Injectable()
export class IncomingService {
  private readonly logger = new Logger(IncomingService.name);
  private readonly errorHandler: BaseErrorHandler;

  constructor(
    private readonly incomingRepository: IncomingRepository,
    private readonly createIncomingUseCase: CreateIncomingUseCase,
    private readonly updateIncomingUseCase: UpdateIncomingUseCase,
    private readonly deleteIncomingUseCase: DeleteIncomingUseCase,
    private readonly reactivateIncomingUseCase: ReactivateIncomingUseCase,
  ) {
    this.errorHandler = new BaseErrorHandler(
      this.logger,
      'Incoming',
      incomingErrorMessages,
    );
  }

  /**
   * Crea un nuevo ingreso
   * @param createIncomingDto - DTO con los datos para crear el ingreso
   * @param user - Datos del usuario que realiza la creación
   * @returns Una promesa que resuelve con la respuesta HTTP que contiene el ingreso creado
   * @throws {Error} Si ocurre un error al crear el ingreso
   */
  async create(
    createIncomingDto: CreateIncomingDto,
    user: UserData,
  ): Promise<HttpResponse<Incoming>> {
    try {
      return await this.createIncomingUseCase.execute(createIncomingDto, user);
    } catch (error) {
      this.errorHandler.handleError(error, 'creating');
    }
  }

  /**
   * Actualiza un ingreso existente
   * @param id - ID del ingreso a actualizar
   * @param updateIncomingDto - DTO con los datos para actualizar el ingreso
   * @param user - Datos del usuario que realiza la actualización
   * @returns Una promesa que resuelve con la respuesta HTTP que contiene el ingreso actualizado
   * @throws {Error} Si ocurre un error al actualizar el ingreso
   */
  async update(
    id: string,
    updateIncomingDto: UpdateIncomingDto,
    user: UserData,
  ): Promise<HttpResponse<Incoming>> {
    try {
      const currentIncoming = await this.findById(id);

      if (!validateChanges(updateIncomingDto, currentIncoming)) {
        return {
          statusCode: HttpStatus.OK,
          message: 'No se detectaron cambios en el ingreso',
          data: currentIncoming,
        };
      }

      return await this.updateIncomingUseCase.execute(
        id,
        updateIncomingDto,
        user,
      );
    } catch (error) {
      this.errorHandler.handleError(error, 'updating');
    }
  }

  /**
   * Busca un ingreso por su ID
   * @param id - ID del ingreso a buscar
   * @returns El ingreso encontrado
   * @throws {NotFoundException} Si el ingreso no existe
   */
  async findOne(id: string): Promise<Incoming> {
    try {
      return this.findById(id);
    } catch (error) {
      this.errorHandler.handleError(error, 'getting');
    }
  }

  /**
   * Obtiene todos los ingresos
   * @returns Una promesa que resuelve con una lista de todos los ingresos
   * @throws {Error} Si ocurre un error al obtener los ingresos
   */
  async findAll(): Promise<Incoming[]> {
    try {
      return this.incomingRepository.findMany();
    } catch (error) {
      this.errorHandler.handleError(error, 'getting');
    }
  }

  /**
   * Busca un ingreso por su ID
   * @param id - ID del ingreso a buscar
   * @returns Una promesa que resuelve con el ingreso encontrado
   * @throws {BadRequestException} Si el ingreso no existe
   */
  async findById(id: string): Promise<Incoming> {
    const incoming = await this.incomingRepository.findById(id);
    if (!incoming) {
      throw new BadRequestException('Ingreso no encontrado');
    }
    return incoming;
  }

  /**
   * Desactiva múltiples ingresos
   * @param deleteIncomingDto - DTO con los IDs de los ingresos a desactivar
   * @param user - Datos del usuario que realiza la operación
   * @returns Respuesta HTTP con los ingresos desactivados
   * @throws {NotFoundException} Si algún ingreso no existe
   */
  async deleteMany(
    deleteIncomingDto: DeleteIncomingDto,
    user: UserData,
  ): Promise<HttpResponse<Incoming[]>> {
    try {
      validateArray(deleteIncomingDto.ids, 'IDs de ingresos');
      return await this.deleteIncomingUseCase.execute(deleteIncomingDto, user);
    } catch (error) {
      this.errorHandler.handleError(error, 'deactivating');
    }
  }

  /**
   * Reactiva múltiples ingresos
   * @param ids - Lista de IDs de los ingresos a reactivar
   * @param user - Datos del usuario que realiza la operación
   * @returns Respuesta HTTP con los ingresos reactivados
   * @throws {NotFoundException} Si algún ingreso no existe
   */
  async reactivateMany(
    ids: string[],
    user: UserData,
  ): Promise<HttpResponse<Incoming[]>> {
    try {
      validateArray(ids, 'IDs de ingresos');
      return await this.reactivateIncomingUseCase.execute(ids, user);
    } catch (error) {
      this.errorHandler.handleError(error, 'reactivating');
    }
  }
}
