import { Module } from '@nestjs/common';
import { RolService } from './rol.service';
import { RolController } from './rol.controller';
import { PrismaModule } from '@prisma/prisma';
import { AuditModule } from '../audit/audit.module';

@Module({
  controllers: [RolController],
  providers: [RolService],
  imports: [PrismaModule, AuditModule],
  exports: [RolService],
})
export class RolModule {}
