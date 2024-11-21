import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { OutgoingService } from './outgoing.service';
import { CreateOutgoingDto } from './dto/create-outgoing.dto';
import { UpdateOutgoingDto } from './dto/update-outgoing.dto';

@Controller('outgoing')
export class OutgoingController {
  constructor(private readonly outgoingService: OutgoingService) {}

  @Post()
  create(@Body() createOutgoingDto: CreateOutgoingDto) {
    return this.outgoingService.create(createOutgoingDto);
  }

  @Get()
  findAll() {
    return this.outgoingService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.outgoingService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOutgoingDto: UpdateOutgoingDto) {
    return this.outgoingService.update(+id, updateOutgoingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.outgoingService.remove(+id);
  }
}
