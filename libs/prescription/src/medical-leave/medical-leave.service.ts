import { Injectable } from '@nestjs/common';
import { CreateMedicalLeaveDto } from './dto/create-medical-leave.dto';
import { UpdateMedicalLeaveDto } from './dto/update-medical-leave.dto';

@Injectable()
export class MedicalLeaveService {
  create(createMedicalLeaveDto: CreateMedicalLeaveDto) {
    return 'This action adds a new medicalLeave';
  }

  findAll() {
    return `This action returns all medicalLeave`;
  }

  findOne(id: number) {
    return `This action returns a #${id} medicalLeave`;
  }

  update(id: number, updateMedicalLeaveDto: UpdateMedicalLeaveDto) {
    return `This action updates a #${id} medicalLeave`;
  }

  remove(id: number) {
    return `This action removes a #${id} medicalLeave`;
  }
}
