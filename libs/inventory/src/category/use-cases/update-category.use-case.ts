import { HttpStatus, Injectable } from '@nestjs/common';
import { UpdatePacientDto } from '../dto/update-category.dto';
import { Paciente } from '../entities/category.entity';
import { PacientRepository } from '../repositories/category.repository';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';

@Injectable()
export class UpdatePacientUseCase {
  constructor(
    private readonly pacientRepository: PacientRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    id: string,
    updatePacientDto: UpdatePacientDto,
    user: UserData,
  ): Promise<HttpResponse<Paciente>> {
    const updatedPacient = await this.pacientRepository.transaction(
      async () => {
        // Update pacient
        const pacient = await this.pacientRepository.update(id, {
          nombre: updatePacientDto.nombre,
          apellido: updatePacientDto.apellido,
          dni: updatePacientDto.dni,
          cumpleanos: updatePacientDto.cumpleanos,
          sexo: updatePacientDto.sexo,
          direccion: updatePacientDto.direccion,
          telefono: updatePacientDto.telefono,
          correo: updatePacientDto.correo,
          fechaRegistro: updatePacientDto.fechaRegistro,
          alergias: updatePacientDto.alergias,
          medicamentosActuales: updatePacientDto.medicamentosActuales,
          contactoEmergencia: updatePacientDto.contactoEmergencia,
          telefonoEmergencia: updatePacientDto.telefonoEmergencia,
          seguroMedico: updatePacientDto.seguroMedico,
          estadoCivil: updatePacientDto.estadoCivil,
          ocupacion: updatePacientDto.ocupacion,
          lugarTrabajo: updatePacientDto.lugarTrabajo,
          tipoSangre: updatePacientDto.tipoSangre,
          antecedentesFamiliares: updatePacientDto.antecedentesFamiliares,
          habitosVida: updatePacientDto.habitosVida,
          vacunas: updatePacientDto.vacunas,
          medicoCabecera: updatePacientDto.medicoCabecera,
          idioma: updatePacientDto.idioma,
          autorizacionTratamiento: updatePacientDto.autorizacionTratamiento,
          observaciones: updatePacientDto.observaciones,
          fotografiaPaciente: updatePacientDto.fotografiaPaciente,
        });

        // Register audit
        await this.auditService.create({
          entityId: pacient.id,
          entityType: 'paciente',
          action: AuditActionType.UPDATE,
          performedById: user.id,
          createdAt: new Date(),
        });

        return pacient;
      },
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Paciente actualizado exitosamente',
      data: updatedPacient,
    };
  }
}
