import { Injectable } from '@nestjs/common';
import { UpdatePatientDto } from '../dto/update-pacient.dto';
import { Patient } from '../entities/pacient.entity';
import { PacientRepository } from '../repositories/pacient.repository';
import { UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';

@Injectable()
export class UpdatePatientUseCase {
  constructor(
    private readonly pacientRepository: PacientRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    id: string,
    updatePatientDto: UpdatePatientDto,
    user: UserData,
  ): Promise<BaseApiResponse<Patient>> {
    const updatedPatient = await this.pacientRepository.transaction(
      async () => {
        // Update patient
        const patient = await this.pacientRepository.update(id, {
          name: updatePatientDto.name,
          lastName: updatePatientDto.lastName,
          dni: updatePatientDto.dni,
          birthDate: updatePatientDto.birthDate,
          gender: updatePatientDto.gender,
          address: updatePatientDto.address,
          phone: updatePatientDto.phone,
          email: updatePatientDto.email,
          emergencyContact: updatePatientDto.emergencyContact,
          emergencyPhone: updatePatientDto.emergencyPhone,
          healthInsurance: updatePatientDto.healthInsurance,
          maritalStatus: updatePatientDto.maritalStatus,
          occupation: updatePatientDto.occupation,
          workplace: updatePatientDto.workplace,
          bloodType: updatePatientDto.bloodType,
          primaryDoctor: updatePatientDto.primaryDoctor,
          sucursal: updatePatientDto.sucursal,
          notes: updatePatientDto.notes,
          patientPhoto: updatePatientDto.patientPhoto,
          isActive: true,
        });

        // Register audit
        await this.auditService.create({
          entityId: patient.id,
          entityType: 'patient',
          action: AuditActionType.UPDATE,
          performedById: user.id,
          createdAt: new Date(),
        });

        return patient;
      },
    );

    return {
      success: true,
      message: 'Paciente Actualizado exitosamente',
      data: updatedPatient,
    };
  }
}
