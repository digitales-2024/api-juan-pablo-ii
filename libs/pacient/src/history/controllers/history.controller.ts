import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { MedicalHistoryService } from '../services/history.service';
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
} from '@nestjs/swagger';
import { UserData } from '@login/login/interfaces';
import {
  CreateMedicalHistoryDto,
  UpdateMedicalHistoryDto,
  DeleteMedicalHistoryDto,
} from '../dto';
import { MedicalHistory } from '../entities/history.entity';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';
/**
 * Controlador REST para gestionar historias médicas.
 * Expone endpoints para operaciones CRUD sobre historias.
 */
@ApiTags('Medical History')
@ApiBadRequestResponse({
  description:
    'Bad Request - Error en la validación de datos o solicitud incorrecta',
})
@ApiUnauthorizedResponse({
  description: 'Unauthorized - No autorizado para realizar esta operación',
})
@Controller({ path: 'medical-history', version: '1' })
@Auth()
export class MedicalHistoryController {
  constructor(private readonly medicalHistoryService: MedicalHistoryService) {}

  /**
   * Crea una nueva historia médica
   */
  @Post()
  @ApiOperation({ summary: 'Crear nueva historia médica' })
  @ApiResponse({
    status: 201,
    description: 'Historia médica creada exitosamente',
    type: BaseApiResponse<MedicalHistory>,
  })
  @ApiBadRequestResponse({
    description: 'Datos de entrada inválidos o historia médica ya existe',
  })
  create(
    @Body() createMedicalHistoryDto: CreateMedicalHistoryDto,
    @GetUser() user: UserData,
  ): Promise<BaseApiResponse<MedicalHistory>> {
    return this.medicalHistoryService.create(createMedicalHistoryDto, user);
  }

  /**
   * Obtiene todas las historias médicas
   */
  @Get()
  @ApiOperation({ summary: 'Obtener todas las historias médicas' })
  @ApiResponse({
    status: 200,
    description: 'Lista de todas las historias médicas',
    type: [MedicalHistory],
  })
  findAll(): Promise<MedicalHistory[]> {
    return this.medicalHistoryService.findAll();
  }

  /**
   * Obtiene una historia médica por su ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Obtener historia médica por ID' })
  @ApiParam({ name: 'id', description: 'ID de la historia médica' })
  @ApiOkResponse({
    description: 'Historia médica encontrada',
    type: MedicalHistory,
  })
  @ApiNotFoundResponse({
    description: 'Historia médica no encontrada',
  })
  findOne(@Param('id') id: string): Promise<MedicalHistory> {
    return this.medicalHistoryService.findOne(id);
  }

  /**
   * Actualiza una historia médica existente
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar historia médica existente' })
  @ApiResponse({
    status: 200,
    description: 'Historia médica actualizada exitosamente',
    type: BaseApiResponse<MedicalHistory>,
  })
  update(
    @Param('id') id: string,
    @Body() updateMedicalHistoryDto: UpdateMedicalHistoryDto,
    @GetUser() user: UserData,
  ): Promise<BaseApiResponse<MedicalHistory>> {
    return this.medicalHistoryService.update(id, updateMedicalHistoryDto, user);
  }

  /**
   * Desactiva múltiples historias médicas
   */
  @Delete('remove/all')
  @ApiOperation({ summary: 'Desactivar múltiples historias médicas' })
  @ApiResponse({
    status: 200,
    description: 'Historias médicas desactivadas exitosamente',
    type: BaseApiResponse<MedicalHistory[]>,
  })
  @ApiBadRequestResponse({
    description: 'IDs inválidos o historias médicas no existen',
  })
  deleteMany(
    @Body() deleteMedicalHistoryDto: DeleteMedicalHistoryDto,
    @GetUser() user: UserData,
  ): Promise<BaseApiResponse<MedicalHistory[]>> {
    return this.medicalHistoryService.deleteMany(deleteMedicalHistoryDto, user);
  }

  /**
   * Reactiva múltiples historias médicas
   */
  @Patch('reactivate/all')
  @ApiOperation({ summary: 'Reactivar múltiples historias médicas' })
  @ApiOkResponse({
    description: 'Historias médicas reactivadas exitosamente',
    type: BaseApiResponse<MedicalHistory[]>,
  })
  @ApiBadRequestResponse({
    description: 'IDs inválidos o historias médicas no existen',
  })
  reactivateAll(
    @Body() deleteMedicalHistoryDto: DeleteMedicalHistoryDto,
    @GetUser() user: UserData,
  ): Promise<BaseApiResponse<MedicalHistory[]>> {
    return this.medicalHistoryService.reactivateMany(
      deleteMedicalHistoryDto.ids,
      user,
    );
  }

  /**
   * Obtiene una historia médica por ID con todas sus actualizaciones e imágenes
   */
  @Get(':id/complete')
  @ApiOperation({ summary: 'Obtener historia médica completa por ID' })
  @ApiParam({ name: 'id', description: 'ID de la historia médica' })
  @ApiResponse({
    status: 200,
    description: 'Historia médica encontrada con actualizaciones e imágenes',
    type: MedicalHistory,
  })
  async findOneComplete(@Param('id') id: string): Promise<
    BaseApiResponse<
      MedicalHistory & {
        updates: Record<
          string,
          {
            service: string;
            staff: string;
            branch: string;
            images: Array<{ id: string; url: string }>;
          }
        >;
      }
    >
  > {
    return this.medicalHistoryService.findOneComplete(id);
  }
}
