import {
  BadRequestException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PacientRepository } from '../repositories/pacient.repository';
import { Patient } from '../entities/pacient.entity';
import { CreatePatientDto } from '../dto/create-pacient.dto';
import { UpdatePatientDto } from '../dto/update-pacient.dto';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { validateArray } from '@prisma/prisma/utils';
import { CreatePatientUseCase } from '../use-cases/create-pacient.use-case';
import { UpdatePatientUseCase } from '../use-cases/update-pacient.use-case';
import { BaseErrorHandler } from 'src/common/error-handlers/service-error.handler';
import { pacientErrorMessages } from '../errors/errors-pacient';
import { DeletePatientDto } from '../dto';
import { DeletePatientsUseCase, ReactivatePacientUseCase } from '../use-cases';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';
import { CloudflareService } from 'src/cloudflare/cloudflare.service';

@Injectable()
export class PacientService {
  private readonly logger = new Logger(PacientService.name);
  private readonly errorHandler: BaseErrorHandler;

  constructor(
    private readonly pacientRepository: PacientRepository,
    private readonly createPatientUseCase: CreatePatientUseCase,
    private readonly updatePatientUseCase: UpdatePatientUseCase,
    private readonly deletePatientsUseCase: DeletePatientsUseCase,
    private readonly reactivatePatientUseCase: ReactivatePacientUseCase,
    private readonly cloudflareService: CloudflareService,
  ) {
    this.errorHandler = new BaseErrorHandler(
      this.logger,
      'Patient',
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
    createPatientDto: CreatePatientDto,
    user: UserData,
  ): Promise<BaseApiResponse<Patient>> {
    try {
      // Validar si el DNI ya existe
      const dniExists = await this.validateDNIExists(createPatientDto.dni);
      if (dniExists) {
        throw new BadRequestException('Ya existe un paciente con este DNI');
      }

      return await this.createPatientUseCase.execute(createPatientDto, user);

      // imagwenw del paciente
      // id del paciente y el url
      //id del registro imagen del paciente
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
    updatePatientDto: UpdatePatientDto,
    user: UserData,
  ): Promise<BaseApiResponse<Patient>> {
    try {
      return await this.updatePatientUseCase.execute(
        id,
        updatePatientDto,
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
  async findOne(id: string): Promise<Patient> {
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
  async findAll(): Promise<Patient[]> {
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
  async findById(id: string): Promise<Patient> {
    const patient = await this.pacientRepository.findById(id);
    if (!patient) {
      throw new BadRequestException('Paciente no encontrado');
    }
    return patient;
  }

  /**
   * Valida si un DNI ya está registrado
   * @param dni - DNI a validar
   * @returns true si el DNI ya está registrado, false si no
   */
  async validateDNIExists(dni: string): Promise<boolean> {
    const existingPacients = await this.pacientRepository.findPatientByDNI(dni);
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
    deletePatientDto: DeletePatientDto,
    user: UserData,
  ): Promise<BaseApiResponse<Patient[]>> {
    try {
      // Validar el array de IDs
      validateArray(deletePatientDto.ids, 'IDs de pacientes');

      return await this.deletePatientsUseCase.execute(deletePatientDto, user);
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
  ): Promise<BaseApiResponse<Patient[]>> {
    try {
      // Validar el array de IDs
      validateArray(ids, 'IDs de pacientes');

      return await this.reactivatePatientUseCase.execute(ids, user);
    } catch (error) {
      this.errorHandler.handleError(error, 'reactivating');
    }
  }

  /**
   * Sube una imagen y devuelve la URL
   * @param image - Imagen a subir
   * @returns Respuesta HTTP con la URL de la imagen subida
   * @throws {BadRequestException} Si no se proporciona una imagen, o si se proporciona un array de archivos
   * @throws {InternalServerErrorException} Si ocurre un error al subir la imagen
   */
  async uploadImage(image: Express.Multer.File): Promise<HttpResponse<string>> {
    let imageUrl: string = null;

    try {
      if (!image) {
        throw new BadRequestException('Image not provided');
      }

      // Validar que solo se suba un archivo
      if (Array.isArray(image)) {
        throw new BadRequestException(
          'Only one file can be uploaded at a time',
        );
      }

      // Validar que el archivo sea una imagen
      const validMimeTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
      ];
      if (!validMimeTypes.includes(image.mimetype)) {
        throw new BadRequestException(
          'The file must be an image in JPEG, PNG, GIF, or WEBP format',
        );
      }

      // Sube la imagen y devuelve la URL
      imageUrl = await this.cloudflareService.uploadImage(image);
      //que lo guar en una tabla de la base de datos
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Image uploaded successfully',
        data: imageUrl,
      };
    } catch (error) {
      this.logger.error(`Error uploading image: ${error.message}`, error.stack);

      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      throw new InternalServerErrorException('Error subiendo la imagen');
    }
  }

  /**
   * Crea un nuevo paciente con imagen opcional
   * @param createPatientDto - DTO con los datos para crear el paciente
   * @param image - Archivo de imagen del paciente (opcional)
   * @param user - Datos del usuario que realiza la creación
   * @returns Una promesa que resuelve con la respuesta HTTP que contiene el paciente creado
   */
  async createPatientWithImage(
    createPatientDto: CreatePatientDto,
    image: Express.Multer.File,
    user: UserData,
  ): Promise<BaseApiResponse<Patient>> {
    // Validar si el DNI ya existe
    const dniExists = await this.validateDNIExists(createPatientDto.dni);
    if (dniExists) {
      throw new BadRequestException('Ya existe un paciente con este DNI');
    }

    // Si no hay imagen, solo creamos el paciente
    if (!image) {
      return await this.create(createPatientDto, user);
    }

    // Si hay imagen, primero la subimos
    const imageResponse = await this.uploadImage(image);

    // Creamos el paciente
    const createdPatientResponse = await this.create(createPatientDto, user);

    // Actualizamos el paciente con la URL de la imagen
    return await this.update(
      createdPatientResponse.data.id,
      { patientPhoto: imageResponse.data },
      user,
    );
  }
}
