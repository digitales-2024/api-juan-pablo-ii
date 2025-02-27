import {
  BadRequestException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
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
import { MedicalHistoryService } from '@pacient/pacient/history/services/history.service';
import { CreateMedicalHistoryDto } from '@pacient/pacient/history/dto/create-history.dto';

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
    private readonly createMedicalHistory: MedicalHistoryService,
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

  async findPatientByDni(dni: string): Promise<Patient[]> {
    return this.pacientRepository.findPatientByDNI(dni);
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
    console.log('la iamgen se creo correctametne');
    if (!image) {
      throw new BadRequestException('Image not provided');
    }

    if (Array.isArray(image)) {
      throw new BadRequestException('Only one file can be uploaded at a time');
    }

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

    try {
      const imageUrl = await this.cloudflareService.uploadImage(image);
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Image uploaded successfully',
        data: imageUrl,
      };
    } catch (error) {
      this.logger.error(`Error uploading image: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error subiendo la imagen');
    }
  }
  /**
   * Actualizar imagen
   * @param image Imagen a actualizar
   * @param existingFileName Nombre del archivo existente
   * @returns URL de la imagen actualizada
   */
  async updateImage(
    image: Express.Multer.File,
    existingFileName: string,
  ): Promise<HttpResponse<string>> {
    console.log('la imgen se creoactualizo correctametne');
    if (!image) {
      throw new BadRequestException('Image not provided');
    }

    if (Array.isArray(image)) {
      throw new BadRequestException('Only one file can be uploaded at a time');
    }

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

    try {
      const imageUrl = await this.cloudflareService.updateImage(
        image,
        existingFileName,
      );
      return {
        statusCode: HttpStatus.OK,
        message: 'Image updated successfully',
        data: imageUrl,
      };
    } catch (error) {
      this.logger.error(`Error updating image: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error updating image');
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
    console.log('createPatientWithImage', createPatientDto, image, user);
    // Validar si el DNI ya existe
    const dniExists = await this.validateDNIExists(createPatientDto.dni);
    if (dniExists) {
      throw new BadRequestException('Ya existe un paciente con este DNI');
    }

    let patientResponse: BaseApiResponse<Patient>;

    // Si no hay imagen, creamos el paciente
    if (!image) {
      patientResponse = await this.create(createPatientDto, user);
    } else {
      // Si hay imagen, primero la subimos, luego creamos y actualizamos al paciente
      const imageResponse = await this.uploadImage(image);
      const createdPatientResponse = await this.create(createPatientDto, user);
      patientResponse = await this.update(
        createdPatientResponse.data.id,
        { patientPhoto: imageResponse.data },
        user,
      );
    }

    // Creamos la historia médica utilizando el id del paciente registrado  sin datos de historia médica
    await this.createMedicalHistory.create(
      { patientId: patientResponse.data.id } as CreateMedicalHistoryDto, // Asegúrate de tipar correctamente el objeto conforme a tu DTO
      user,
    );

    return patientResponse;
  }

  /**
   * Actualiza un paciente existente con imagen opcional
   * @param id - ID del paciente a actualizar
   * @param updatePatientDto - DTO con los datos para actualizar el paciente
   * @param image - Archivo de imagen del paciente (opcional)
   * @param user - Datos del usuario que realiza la actualización
   * @returns Una promesa que resuelve con la respuesta HTTP que contiene el paciente actualizado
   */
  async updatePatientWithImage(
    id: string,
    updatePatientDto: UpdatePatientDto,
    image: Express.Multer.File,
    user: UserData,
  ): Promise<BaseApiResponse<Patient>> {
    // Obtener el paciente actual para verificar la imagen existente
    const currentPatient = await this.findOne(id);

    // Si no hay nueva imagen, solo actualizar datos
    if (!image) {
      return await this.update(id, updatePatientDto, user);
    }

    // Procesar la imagen según el caso
    let imageUrl: string;
    if (!currentPatient.patientPhoto) {
      // Si no tenía imagen, subir como nueva
      const imageResponse = await this.uploadImage(image);
      imageUrl = imageResponse.data;
    } else {
      // Si ya tenía imagen, actualizar la existente
      const existingFileName = currentPatient.patientPhoto.split('/').pop();
      const imageResponse = await this.updateImage(image, existingFileName);
      imageUrl = imageResponse.data;
    }

    // Actualizar paciente con la nueva imagen y datos
    return await this.update(
      id,
      { ...updatePatientDto, patientPhoto: imageUrl },
      user,
    );
  }
}
