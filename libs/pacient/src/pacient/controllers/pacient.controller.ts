// pacient.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { PacientService } from '../services/pacient.service';
import { Auth, GetUser } from '@login/login/admin/auth/decorators';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiParam,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { UserData } from '@login/login/interfaces';
import { CreatePatientDto } from '../dto/create-pacient.dto';
import { UpdatePatientDto } from '../dto/update-pacient.dto';
import { Patient } from '../entities/pacient.entity';
import { DeletePatientDto } from '../dto';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { RemoveImageInterceptor } from './remove-image.interceptor';

/**
 * Controlador REST para gestionar pacientes.
 * Expone endpoints para operaciones CRUD sobre pacientes.
 */
@ApiTags('Pacient')
@ApiBadRequestResponse({
  description:
    'Bad Request - Error en la validación de datos o solicitud incorrecta',
})
@ApiUnauthorizedResponse({
  description: 'Unauthorized - No autorizado para realizar esta operación',
})
@Controller({ path: 'paciente', version: '1' })
@Auth()
export class PacientController {
  constructor(private readonly pacientService: PacientService) {}

  /**
   * Crea un nuevo paciente
   */
  @Post()
  @ApiOperation({ summary: 'Crear nuevo paciente' })
  @ApiResponse({
    status: 201,
    description: 'Paciente creado exitosamente',
    type: BaseApiResponse<Patient>,
  })
  @ApiBadRequestResponse({
    description: 'Datos de entrada inválidos o paciente ya existe',
  })
  create(
    @Body() createPatientDto: CreatePatientDto,
    @GetUser() user: UserData,
  ): Promise<BaseApiResponse<Patient>> {
    return this.pacientService.create(createPatientDto, user);
  }

  /**
   * Obtiene todos los pacientes
   */
  @Get()
  @ApiOperation({ summary: 'Obtener todos los pacientes' })
  @ApiResponse({
    status: 200,
    description: 'Lista de todos los pacientes',
    type: [Patient],
  })
  findAll(): Promise<Patient[]> {
    return this.pacientService.findAll();
  }

  /**
   * Obtiene un paciente por su ID
   */
  @ApiOperation({ summary: 'Obtener paciente por ID' })
  @ApiParam({ name: 'id', description: 'ID   paciente' })
  @ApiOkResponse({
    description: 'Paciente encontrado',
    type: Patient,
  })
  @ApiNotFoundResponse({
    description: 'Paciente no encontrado',
  })
  @Get(':id')
  findOne(@Param('id') id: string): Promise<Patient> {
    return this.pacientService.findOne(id);
  }

  /**
   * Actualiza un paciente existente
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar paciente existente' })
  @ApiResponse({
    status: 200,
    description: 'Paciente actualizado exitosamente',
    type: BaseApiResponse<Patient>,
  })
  update(
    @Param('id') id: string,
    @Body() updatePatientDto: UpdatePatientDto,
    @GetUser() user: UserData,
  ): Promise<BaseApiResponse<Patient>> {
    return this.pacientService.update(id, updatePatientDto, user);
  }

  /**
   * Desactiva múltiples pacientes
   */
  @Delete('remove/all')
  @ApiOperation({ summary: 'Desactivar múltiples pacientes' })
  @ApiResponse({
    status: 200,
    description: 'Pacientes desactivados exitosamente',
    type: BaseApiResponse<Patient[]>,
  })
  @ApiBadRequestResponse({
    description: 'IDs inválidos o pacientes no existen',
  })
  deleteMany(
    @Body() deletePatientDto: DeletePatientDto,
    @GetUser() user: UserData,
  ): Promise<BaseApiResponse<Patient[]>> {
    return this.pacientService.deleteMany(deletePatientDto, user);
  }

  /**
   * Reactiva múltiples pacientes
   */
  @Patch('reactivate/all')
  @ApiOperation({ summary: 'Reactivar múltiples pacientes' })
  @ApiOkResponse({
    description: 'Pacientes reactivados exitosamente',
    type: BaseApiResponse<Patient[]>,
  })
  @ApiBadRequestResponse({
    description: 'IDs inválidos o pacientes no existen',
  })
  /**
   * Reactiva múltiples pacientes.
   * @param deletePatientDto - DTO que contiene los IDs de los pacientes a reactivar.
   * @param user - Datos del usuario que realiza la operación.
   * @returns Una promesa que resuelve con una respuesta HTTP que contiene los pacientes reactivados.
   */
  reactivateAll(
    @Body() deletePatientDto: DeletePatientDto,
    @GetUser() user: UserData,
  ): Promise<BaseApiResponse<Patient[]>> {
    return this.pacientService.reactivateMany(deletePatientDto.ids, user);
  }

  /**
   * Crea un nuevo paciente con imagen opcional
   * @param createPatientDto - DTO con los datos para crear el paciente
   * @param image - Archivo de imagen del paciente (opcional)
   * @param user - Datos del usuario que realiza la creación
   * @returns Promesa que resuelve con la respuesta de la API que contiene el paciente creado
   */
  @Post('create-with-image')
  @ApiOperation({ summary: 'Crear nuevo paciente con imagen opcional' })
  @ApiResponse({
    status: 201,
    description: 'Paciente creado exitosamente',
    type: BaseApiResponse<Patient>,
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Juan Pérez' },
        lastName: { type: 'string', example: 'González' },
        dni: { type: 'string', example: '12345678' },
        birthDate: { type: 'string', format: 'date', example: '1990-01-01' },
        gender: { type: 'string', example: 'Masculino' },
        address: { type: 'string', example: 'Av. Principal 123' },
        phone: { type: 'string', example: '+51999999999' },
        email: { type: 'string', example: 'juan.perez@example.com' },
        emergencyContact: { type: 'string', example: 'María Pérez' },
        emergencyPhone: { type: 'string', example: '+51999999999' },
        healthInsurance: { type: 'string', example: 'Seguro Salud' },
        maritalStatus: { type: 'string', example: 'Soltero' },
        occupation: { type: 'string', example: 'Ingeniero' },
        workplace: {
          type: 'string',
          example: 'Empresa XYZ, Av. Industrial 456',
        },
        bloodType: { type: 'string', example: 'O+' },
        primaryDoctor: {
          type: 'string',
          example: 'Dr. Juan Pérez, +51999999999',
        },
        language: { type: 'string', example: 'Español' },
        notes: {
          type: 'string',
          example: 'Paciente con antecedentes de alergias severas',
        },
        patientPhoto: { type: 'string', example: null },
        image: {
          type: 'string',
          format: 'binary',
          description: 'Imagen del paciente (opcional)',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('image'), RemoveImageInterceptor)
  async createWithImage(
    @Body() createPatientDto: CreatePatientDto,
    @UploadedFile() image: Express.Multer.File,
    @GetUser() user: UserData,
  ): Promise<BaseApiResponse<Patient>> {
    // Log para verificar los datos que llegan al servidor
    console.log('Datos recibidos en el servidor:', {
      createPatientDto,
      image,
      user,
    });

    return this.pacientService.createPatientWithImage(
      createPatientDto,
      image,
      user,
    );
  }

  /**
   * Actualiza un paciente existente con imagen opcional
   */
  @Patch(':id/update-with-image')
  @ApiOperation({
    summary: 'Actualizar paciente existente con imagen opcional',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Juan Pérez' },
        lastName: { type: 'string', example: 'González' },
        dni: { type: 'string', example: '12345678' },
        birthDate: { type: 'string', format: 'date', example: '1990-01-01' },
        gender: { type: 'string', example: 'Masculino' },
        address: { type: 'string', example: 'Av. Principal 123' },
        phone: { type: 'string', example: '+51999999999' },
        email: { type: 'string', example: 'juan.perez@example.com' },
        emergencyContact: { type: 'string', example: 'María Pérez' },
        emergencyPhone: { type: 'string', example: '+51999999999' },
        healthInsurance: { type: 'string', example: 'Seguro Salud' },
        maritalStatus: { type: 'string', example: 'Soltero' },
        occupation: { type: 'string', example: 'Ingeniero' },
        workplace: {
          type: 'string',
          example: 'Empresa XYZ, Av. Industrial 456',
        },
        bloodType: { type: 'string', example: 'O+' },
        primaryDoctor: {
          type: 'string',
          example: 'Dr. Juan Pérez, +51999999999',
        },
        language: { type: 'string', example: 'Español' },
        notes: {
          type: 'string',
          example: 'Paciente con antecedentes de alergias severas',
        },
        patientPhoto: { type: 'string', example: null },
        image: {
          type: 'string',
          format: 'binary',
          description: 'Imagen del paciente (opcional)',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Paciente actualizado exitosamente',
    type: BaseApiResponse<Patient>,
  })
  @UseInterceptors(FileInterceptor('image'))
  async updateWithImage(
    @Param('id') id: string,
    @Body() updatePatientDto: UpdatePatientDto,
    @UploadedFile() image: Express.Multer.File,
    @GetUser() user: UserData,
  ): Promise<BaseApiResponse<Patient>> {
    // Interceptar y corregir los datos
    if (Array.isArray(updatePatientDto.patientPhoto)) {
      updatePatientDto.patientPhoto = updatePatientDto.patientPhoto[0];
    }

    // Eliminar los campos id e image de updatePatientDto
    delete updatePatientDto.id;
    delete updatePatientDto.image;

    return this.pacientService.updatePatientWithImage(
      id,
      updatePatientDto,
      image,
      user,
    );
  }
}
