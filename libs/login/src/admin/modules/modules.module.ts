import { Module } from '@nestjs/common';
import { ModulesService } from './modules.service';
import { ModulesController } from './modules.controller';
import { PrismaModule } from '@prisma/prisma';

@Module({
  controllers: [ModulesController],
  providers: [ModulesService],
  imports: [PrismaModule],
})
export class ModulesModule {}
