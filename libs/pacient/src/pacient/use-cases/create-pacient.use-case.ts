import { HttpStatus, Injectable } from '@nestjs/common';
import { CreatePacienteDto } from '../dto/create-pacient.dto';
import { Paciente } from '../entities/pacient.entity';
import { PacientRepository } from '../repositories/pacient.repository';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';

@Injectable()
export class CreatePacientUseCase {
  constructor(
    private readonly pacientRepository: PacientRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    createPacientDto: CreatePacienteDto,
    user: UserData,
  ): Promise<HttpResponse<Paciente>> {
    const newPacient = await this.pacientRepository.transaction(async () => {
      // Create pacient
      const pacient = await this.pacientRepository.create({
        nombre: createPacientDto.nombre,
        apellido: createPacientDto.apellido,
        dni: createPacientDto.dni,
        cumpleanos: createPacientDto.cumpleanos,
        sexo: createPacientDto.sexo,
        direccion: createPacientDto.direccion,
        telefono: createPacientDto.telefono,
        correo: createPacientDto.correo,
        fechaRegistro: createPacientDto.fechaRegistro,
        alergias: createPacientDto.alergias,
        medicamentosActuales: createPacientDto.medicamentosActuales,
        contactoEmergencia: createPacientDto.contactoEmergencia,
        telefonoEmergencia: createPacientDto.telefonoEmergencia,
        seguroMedico: createPacientDto.seguroMedico,
        estadoCivil: createPacientDto.estadoCivil,
        ocupacion: createPacientDto.ocupacion,
        lugarTrabajo: createPacientDto.lugarTrabajo,
        tipoSangre: createPacientDto.tipoSangre,
        antecedentesFamiliares: createPacientDto.antecedentesFamiliares,
        habitosVida: createPacientDto.habitosVida,
        vacunas: createPacientDto.vacunas,
        medicoCabecera: createPacientDto.medicoCabecera,
        idioma: createPacientDto.idioma,
        autorizacionTratamiento: createPacientDto.autorizacionTratamiento,
        observaciones: createPacientDto.observaciones,
        fotografiaPaciente: createPacientDto.fotografiaPaciente,
      });

      // Register audit
      await this.auditService.create({
        entityId: pacient.id,
        entityType: 'paciente',
        action: AuditActionType.CREATE,
        performedById: user.id,
        createdAt: new Date(),
      });

      return pacient;
    });

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Paciente creado exitosamente',
      data: newPacient,
    };
  }
}
