import { Module } from '@nestjs/common';
import { ServiceRepository } from './repositories/service.repository';
import { ServiceTypeRepository } from './repositories/service-type.repository';
import { ServiceService } from './services/service.service';
import { ServiceTypeService } from './services/service-type.service';
import { ServiceController } from './controllers/service.controller';
import { ServiceTypeController } from './controllers/service-type.controller';
import { AuditModule } from '@login/login/admin/audit/audit.module';
import { CreateServiceUseCase } from './use-cases/create-service.use-case';
import { UpdateServiceUseCase } from './use-cases/update-service.use-case';
import {
  DeleteServiceUseCase,
  DeleteServicesUseCase,
} from './use-cases/delete-service.use-case';
import { CreateServiceTypeUseCase } from './use-cases/create-servicetype.use-case';
import { UpdateServiceTypeUseCase } from './use-cases/update-servicetype.use-case';
import { DeleteServiceTypesUseCase } from './use-cases/delete-servicetype.use-case';
import { ReactivateServicesUseCase } from './use-cases/reactive-service.use-case';
import { ReactivateServiceTypesUseCase } from './use-cases/reactive-servicetype.use-case';

/**
 * Módulo que gestiona los servicios y tipos de servicios del sistema.
 * Ejemplo de implementación de la librería Prisma.
 * @module ServiceModule
 */
@Module({
  imports: [AuditModule],
  providers: [
    ServiceRepository,
    ServiceTypeRepository,
    ServiceService,
    ServiceTypeService,
    CreateServiceUseCase,
    UpdateServiceUseCase,
    DeleteServiceUseCase,
    DeleteServicesUseCase,
    CreateServiceTypeUseCase,
    UpdateServiceTypeUseCase,
    DeleteServiceTypesUseCase,
    ReactivateServicesUseCase,
    ReactivateServiceTypesUseCase,
  ],
  controllers: [ServiceController, ServiceTypeController],
  exports: [ServiceService, ServiceTypeService],
})
export class ServiceModule {}
