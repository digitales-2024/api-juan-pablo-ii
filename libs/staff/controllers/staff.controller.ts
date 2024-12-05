import { Controller, Get, Post, Body, Patch, Param } from '@nestjs/common';
import { StaffService } from '../services/staff.service';
import { CreateStaffDto, UpdateStaffDto } from '../dto';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOkResponse,
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
  @ApiOkResponse({
    description: 'Lista de todo el personal médico',
    type: [Staff],
  })
  findAll(): Promise<Staff[]> {
    return this.staffService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({
    description: 'Personal médico encontrado',
    type: Staff,
  })
  findOne(@Param('id') id: string): Promise<Staff> {
    return this.staffService.findOne(id);
  }

  @Patch(':id')
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
}
