import {
  Controller,
  Post,
  Body,
  Param,
  Patch,
  Get,
  Delete,
} from '@nestjs/common';
import { ServiceTypeService } from '../services/service-type.service';
import { CreateServiceTypeDto } from '../dto/create-service-type.dto';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Auth, GetUser } from '@login/login/admin/auth/decorators';
import { ServiceType } from '../entities/service.entity';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { UpdateServiceTypeDto } from '../dto';
import { DeleteServiceTypesDto } from '../dto/delete-service-types.dto';

@ApiTags('ServiceTypes')
@ApiBadRequestResponse({ description: 'Bad Request' })
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@Controller({ path: 'service-types', version: '1' })
@Auth()
export class ServiceTypeController {
  constructor(private readonly serviceTypeService: ServiceTypeService) {}

  @ApiCreatedResponse({
    description: 'ServiceType created successfully',
  })
  @ApiBadRequestResponse({
    description: 'Validation failed or bad request',
  })
  @Post()
  create(
    @Body() createServiceTypeDto: CreateServiceTypeDto,
    @GetUser() user: UserData,
  ): Promise<HttpResponse<ServiceType>> {
    return this.serviceTypeService.create(createServiceTypeDto, user);
  }

  @Patch(':id')
  @ApiOkResponse({ description: 'Design project updated successfully' })
  update(
    @Param('id') id: string,
    @Body() updateServiceDto: UpdateServiceTypeDto,
    @GetUser() user: UserData,
  ): Promise<HttpResponse<ServiceType>> {
    return this.serviceTypeService.update(id, updateServiceDto, user);
  }

  @Get(':id')
  @ApiOkResponse({ description: 'ServiceType found' })
  @ApiNotFoundResponse({ description: 'ServiceType not found' })
  findOne(@Param('id') id: string): Promise<ServiceType> {
    return this.serviceTypeService.findOne(id);
  }

  @Get()
  @ApiOkResponse({
    description: 'Get all services types',
  })
  findAll(): Promise<ServiceType[]> {
    return this.serviceTypeService.findAll();
  }

  @Delete('remove/all')
  @ApiOkResponse({ description: 'Types deleted successfully' })
  @ApiBadRequestResponse({ description: 'Validation failed or bad request' })
  deleteMany(
    @Body() deleteServiceTypesDto: DeleteServiceTypesDto,
    @GetUser() user: UserData,
  ) {
    return this.serviceTypeService.deleteMany(deleteServiceTypesDto, user);
  }

  @Delete(':id')
  @ApiOkResponse({ description: 'ServiceType deleted successfully' })
  @ApiBadRequestResponse({ description: 'Validation failed or bad request' })
  delete(
    @Param('id') id: string,
    @GetUser() user: UserData,
  ): Promise<HttpResponse<ServiceType>> {
    return this.serviceTypeService.delete(id, user);
  }
}
