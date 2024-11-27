import { Module } from '@nestjs/common';
import { ServiceRepository } from './repositories/service.repository';
import { ServiceTypeRepository } from './repositories/service-type.repository';
import { ServiceService } from './services/service.service';
import { ServiceTypeService } from './services/service-type.service';
import { ServiceController } from './controllers/service.controller';
import { ServiceTypeController } from './controllers/service-type.controller';
import { AuditModule } from '@login/login/admin/audit/audit.module';

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
  ],
  controllers: [ServiceController, ServiceTypeController],
  exports: [ServiceService, ServiceTypeService],
})
export class ServiceModule {}
