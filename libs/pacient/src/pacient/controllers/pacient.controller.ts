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
  ApiCreatedResponse,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { CreatePatientDto } from '../dto/create-pacient.dto';
import { UpdatePatientDto } from '../dto/update-pacient.dto';
import { Patient } from '../entities/pacient.entity';
import { DeletePatientDto } from '../dto';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';
import { FileInterceptor } from '@nestjs/platform-express';

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
  reactivateAll(
    @Body() deletePatientDto: DeletePatientDto,
    @GetUser() user: UserData,
  ): Promise<BaseApiResponse<Patient[]>> {
    return this.pacientService.reactivateMany(deletePatientDto.ids, user);
  }

  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
          description: 'Archivo de imagen a subir',
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Imagen subida exitosamente',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number' },
        message: { type: 'string' },
        data: { type: 'string' },
      },
    },
  })
  @Post('upload/image')
  @UseInterceptors(FileInterceptor('image'))
  async uploadImage(
    @UploadedFile() image: Express.Multer.File,
  ): Promise<HttpResponse<string>> {
    return this.pacientService.uploadImage(image);
  }
}
