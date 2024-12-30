import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConsultationRepository } from '../repositories/consultation.repository';
import { Consultation } from '../entities/consultation.entity';
import { CreateConsultationDto } from '../dto/create-consultation.dto';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { CreateConsultationUseCase } from '../use-cases/create-consultation.use-case';
import { BaseErrorHandler } from 'src/common/error-handlers/service-error.handler';
import { consultationErrorMessages } from '../errors/errors-consultation';

@Injectable()
export class ConsultationService {
  private readonly logger = new Logger(ConsultationService.name);
  private readonly errorHandler: BaseErrorHandler;

  constructor(
    private readonly consultationRepository: ConsultationRepository,
    private readonly createConsultationUseCase: CreateConsultationUseCase,
  ) {
    this.errorHandler = new BaseErrorHandler(
      this.logger,
      'Consultation',
      consultationErrorMessages,
    );
  }

  /**
   * Crea una nueva consulta
   * @param createConsultationDto - DTO con los datos para crear la consulta
   * @param user - Datos del usuario que realiza la creación
   * @returns Una promesa que resuelve con la respuesta HTTP que contiene la consulta creada
   * @throws {BadRequestException} Si ya existe una consulta con los datos proporcionados
   * @throws {Error} Si ocurre un error al crear la consulta
   */
  async create(
    createConsultationDto: CreateConsultationDto,
    user: UserData,
  ): Promise<HttpResponse<Consultation>> {
    try {
      return await this.createConsultationUseCase.execute(
        createConsultationDto,
        user,
      );
    } catch (error) {
      this.errorHandler.handleError(error, 'creating');
    }
  }

  /**
   * Busca una consulta por su ID
   * @param id - ID de la consulta a buscar
   * @returns La consulta encontrada
   * @throws {NotFoundException} Si la consulta no existe
   */
  async findOne(id: string): Promise<Consultation> {
    try {
      return this.findById(id);
    } catch (error) {
      this.errorHandler.handleError(error, 'getting');
    }
  }

  /**
   * Obtiene todas las consultas
   * @returns Una promesa que resuelve con una lista de todas las consultas
   * @throws {Error} Si ocurre un error al obtener las consultas
   */
  async findAll(): Promise<Consultation[]> {
    try {
      return this.consultationRepository.findMany();
    } catch (error) {
      this.errorHandler.handleError(error, 'getting');
    }
  }

  /**
   * Busca una consulta por su ID
   * @param id - ID de la consulta a buscar
   * @returns Una promesa que resuelve con la consulta encontrada
   * @throws {BadRequestException} Si la consulta no existe
   */
  async findById(id: string): Promise<Consultation> {
    const consultation = await this.consultationRepository.findById(id);
    if (!consultation) {
      throw new BadRequestException('Consulta no encontrada');
    }
    return consultation;
  }
}
