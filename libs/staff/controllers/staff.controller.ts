import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { StaffService } from '../services/staff.service';
import { CreateStaffDto, DeleteStaffDto, UpdateStaffDto } from '../dto';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { Staff } from '../entities/staff.entity';
import { Auth, GetUser } from '@login/login/admin/auth/decorators';

@ApiTags('Staff')
@ApiBadRequestResponse({
  description:
    'Bad Request - Error en la validación de datos o solicitud incorrecta',
})
@ApiUnauthorizedResponse({
  description: 'Unauthorized - No autorizado para realizar esta operación',
})
@Controller({ path: 'staff', version: '1' })
@Auth()
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Post()
  @ApiOperation({ summary: 'Crear nuevo personal' })
  @ApiCreatedResponse({
    description: 'Personal médico creado exitosamente',
    type: Staff,
  })
  @ApiBadRequestResponse({
    description: 'Datos de entrada inválidos o personal médico ya existe',
  })
  create(
    @Body() createStaffDto: CreateStaffDto,
    @GetUser() user: UserData,
  ): Promise<HttpResponse<Staff>> {
    return this.staffService.create(createStaffDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener Personal' })
  @ApiOkResponse({
    description: 'Lista de todo el personal médico',
    type: [Staff],
  })
  findAll(): Promise<Staff[]> {
    return this.staffService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener personal por ID' })
  @ApiOkResponse({
    description: 'Personal médico encontrado',
    type: Staff,
  })
  findOne(@Param('id') id: string): Promise<Staff> {
    return this.staffService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar personal existente' })
  @ApiOkResponse({
    description: 'Personal médico actualizado exitosamente',
    type: Staff,
  })
  update(
    @Param('id') id: string,
    @Body() updateStaffDto: UpdateStaffDto,
    @GetUser() user: UserData,
  ): Promise<HttpResponse<Staff>> {
    return this.staffService.update(id, updateStaffDto, user);
  }

  /**
   * Elimina múltiple Personal
   */
  @Delete('remove/all')
  @ApiOperation({ summary: 'Actualizar personal existente' })
  @ApiResponse({
    status: 200,
    description: 'Personal eliminado exitosamente',
    type: [Staff],
  })
  @ApiBadRequestResponse({
    description: 'IDs inválidos o personal no existentes',
  })
  deleteMany(
    @Body() deleteStaffDto: DeleteStaffDto,
    @GetUser() user: UserData,
  ): Promise<HttpResponse<Staff[]>> {
    return this.staffService.deleteMany(deleteStaffDto, user);
  }

  /**
   * Reactiva múltiple Personal
   */
  @Patch('reactivate/all')
  @ApiOperation({ summary: 'Reactivar múltiple personal' })
  @ApiOkResponse({
    description: 'Personal reactivado exitosamente',
    type: [Staff],
  })
  @ApiBadRequestResponse({
    description: 'IDs inválidos o personal no existentes',
  })
  reactivateAll(
    @Body() deleteStaffDto: DeleteStaffDto,
    @GetUser() user: UserData,
  ): Promise<HttpResponse<Staff[]>> {
    return this.staffService.reactivateMany(deleteStaffDto.ids, user);
  }
}
