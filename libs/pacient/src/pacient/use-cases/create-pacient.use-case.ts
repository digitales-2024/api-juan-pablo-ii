import { Injectable } from '@nestjs/common';
import { CreatePatientDto } from '../dto/create-pacient.dto';
import { Patient } from '../entities/pacient.entity';
import { PacientRepository } from '../repositories/pacient.repository';
import { UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';

@Injectable()
export class CreatePatientUseCase {
  constructor(
    private readonly pacientRepository: PacientRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    createPatientDto: CreatePatientDto,
    user: UserData,
  ): Promise<BaseApiResponse<Patient>> {
    const newPatient = await this.pacientRepository.transaction(async () => {
      // Create patient
      const patient = await this.pacientRepository.create({
        name: createPatientDto.name,
        lastName: createPatientDto.lastName,
        dni: createPatientDto.dni,
        birthDate: createPatientDto.birthDate,
        gender: createPatientDto.gender,
        address: createPatientDto.address,
        phone: createPatientDto.phone,
        email: createPatientDto.email,
        registrationDate: createPatientDto.registrationDate,
        emergencyContact: createPatientDto.emergencyContact,
        emergencyPhone: createPatientDto.emergencyPhone,
        healthInsurance: createPatientDto.healthInsurance,
        maritalStatus: createPatientDto.maritalStatus,
        occupation: createPatientDto.occupation,
        workplace: createPatientDto.workplace,
        bloodType: createPatientDto.bloodType,
        primaryDoctor: createPatientDto.primaryDoctor,
        language: createPatientDto.language,
        notes: createPatientDto.notes,
        patientPhoto: createPatientDto.patientPhoto,
        isActive: true,
      });

      // Register audit
      await this.auditService.create({
        entityId: patient.id,
        entityType: 'patient',
        action: AuditActionType.CREATE,
        performedById: user.id,
        createdAt: new Date(),
      });

      return patient;
    });

    return {
      success: true,
      message: 'Paciente Creado exitosamente',
      data: newPatient,
    };
  }
}
