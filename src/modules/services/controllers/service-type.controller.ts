import { Controller, Post, Body } from '@nestjs/common';
import { ServiceTypeService } from '../services/service-type.service';
import { CreateServiceTypeDto } from '../dto/create-service-type.dto';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Auth, GetUser } from '@login/login/admin/auth/decorators';
import { ServiceType } from '../entities/service.entity';
import { HttpResponse, UserData } from '@login/login/interfaces';

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
}
