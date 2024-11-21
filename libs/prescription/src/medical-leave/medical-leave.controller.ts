import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MedicalLeaveService } from './medical-leave.service';
import { CreateMedicalLeaveDto } from './dto/create-medical-leave.dto';
import { UpdateMedicalLeaveDto } from './dto/update-medical-leave.dto';

@Controller('medical-leave')
export class MedicalLeaveController {
  constructor(private readonly medicalLeaveService: MedicalLeaveService) {}

  @Post()
  create(@Body() createMedicalLeaveDto: CreateMedicalLeaveDto) {
    return this.medicalLeaveService.create(createMedicalLeaveDto);
  }

  @Get()
  findAll() {
    return this.medicalLeaveService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.medicalLeaveService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMedicalLeaveDto: UpdateMedicalLeaveDto) {
    return this.medicalLeaveService.update(+id, updateMedicalLeaveDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.medicalLeaveService.remove(+id);
  }
}
