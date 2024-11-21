import { Module } from '@nestjs/common';
import { IncomingService } from './incoming.service';
import { IncomingController } from './incoming.controller';

@Module({
  controllers: [IncomingController],
  providers: [IncomingService],
})
export class IncomingModule {}
