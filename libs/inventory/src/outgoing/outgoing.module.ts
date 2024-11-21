import { Module } from '@nestjs/common';
import { OutgoingService } from './outgoing.service';
import { OutgoingController } from './outgoing.controller';

@Module({
  controllers: [OutgoingController],
  providers: [OutgoingService],
})
export class OutgoingModule {}
