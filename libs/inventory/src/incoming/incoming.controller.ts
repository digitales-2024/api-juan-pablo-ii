import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { IncomingService } from './incoming.service';
import { CreateIncomingDto } from './dto/create-incoming.dto';
import { UpdateIncomingDto } from './dto/update-incoming.dto';

@Controller('incoming')
export class IncomingController {
  constructor(private readonly incomingService: IncomingService) {}

  @Post()
  create(@Body() createIncomingDto: CreateIncomingDto) {
    return this.incomingService.create(createIncomingDto);
  }

  @Get()
  findAll() {
    return this.incomingService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.incomingService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateIncomingDto: UpdateIncomingDto) {
    return this.incomingService.update(+id, updateIncomingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.incomingService.remove(+id);
  }
}
