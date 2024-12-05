import {
  BadRequestException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { validateChanges } from '@prisma/prisma/utils';
import { BaseErrorHandler } from 'src/common/error-handlers/service-error.handler';
import { Staff } from '../entities/staff.entity';
import { personalErrorMessages } from '../errors/erros-staff';
import { StaffRepository } from '../repositories/staff.repository';
import { CreateStaffUseCase, UpdateStaffUseCase } from '../use-cases';
import { CreateStaffDto, UpdateStaffDto } from '../dto';
import { SpecializationRepository } from '../repositories/specialization.repository';

/**
 * Servicio que implementa la lógica de negocio para personal médico.
 * Utiliza PersonalRepository para acceder a la base de datos y varios casos de uso
 * para implementar las operaciones principales.
 */
@Injectable()
export class StaffService {
  private readonly logger = new Logger(StaffService.name);
  private readonly errorHandler: BaseErrorHandler;

  constructor(
    private readonly staffRepository: StaffRepository,
    private readonly specializationRepository: SpecializationRepository,
    private readonly createStaffUseCase: CreateStaffUseCase,
    private readonly updateStaffUseCase: UpdateStaffUseCase,
  ) {
    this.errorHandler = new BaseErrorHandler(
      this.logger,
      'Personal',
      personalErrorMessages,
    );
  }

  /**
   * Crea un nuevo personal médico
   * @param createStaffDto - DTO con los datos del personal médico a crear
   * @param user - Datos del usuario que realiza la operación
   * @returns Respuesta HTTP con el personal médico creado
   * @throws {BadRequestException} Si ya existe el personal médico
   */
  async create(
    createStaffDto: CreateStaffDto,
    user: UserData,
  ): Promise<HttpResponse<Staff>> {
    try {
      return await this.createStaffUseCase.execute(createStaffDto, user);
    } catch (error) {
      this.errorHandler.handleError(error, 'creating');
    }
  }

  /**
   * Actualiza un personal médico existente
   * @param id - ID del personal médico a actualizar
   * @param updateStaffDto - DTO con los datos a actualizar
   * @param user - Datos del usuario que realiza la operación
   * @returns Respuesta HTTP con el personal médico actualizado
   * @throws {NotFoundException} Si el personal médico no existe
   */
  async update(
    id: string,
    updateStaffDto: UpdateStaffDto,
    user: UserData,
  ): Promise<HttpResponse<Staff>> {
    try {
      const currentPersonal = await this.findById(id);

      if (!validateChanges(updateStaffDto, currentPersonal)) {
        return {
          statusCode: HttpStatus.OK,
          message: 'No se detectaron cambios en el personal médico',
          data: currentPersonal,
        };
      }

      return await this.updateStaffUseCase.execute(id, updateStaffDto, user);
    } catch (error) {
      this.errorHandler.handleError(error, 'updating');
    }
  }

  /**
   * Obtiene todos los registros de personal médico
   * @returns Lista de todo el personal médico
   */
  async findAll(): Promise<Staff[]> {
    try {
      return this.staffRepository.findMany();
    } catch (error) {
      this.errorHandler.handleError(error, 'getting');
    }
  }

  /**
   * Busca un personal médico por su ID
   * @param id - ID del personal médico a buscar
   * @returns Personal médico encontrado
   * @throws {NotFoundException} Si el personal médico no existe
   */
  async findOne(id: string): Promise<Staff> {
    try {
      return this.findById(id);
    } catch (error) {
      this.errorHandler.handleError(error, 'getting');
    }
  }

  /**
   * Busca un personal médico por su ID (método interno)
   * @param id - ID del personal médico a buscar
   * @returns Personal médico encontrado
   * @throws {BadRequestException} Si el personal médico no existe
   * @internal
   */
  async findById(id: string): Promise<Staff> {
    const personal = await this.staffRepository.findById(id);
    if (!personal) {
      throw new BadRequestException('Personal médico no encontrado');
    }
    return personal;
  }
}
