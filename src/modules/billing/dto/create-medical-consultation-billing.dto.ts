// src/modules/billing/dto/create-service-billing.dto.ts
import { ICreateOrderBase } from '@pay/pay/interfaces';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsUUID,
  IsOptional,
  IsNumber,
  IsString,
  IsDate,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateMedicalConsultationBillingDto implements ICreateOrderBase {
  @ApiProperty({ description: 'ID de la consulta médica' })
  @IsUUID()
  consultaId: string;

  @ApiProperty({ description: 'ID del tipo de movimiento' })
  @IsUUID()
  movementTypeId: string;

  @ApiProperty({ description: 'Moneda (default: PEN)', default: 'PEN' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiProperty({ description: 'Total preestablecido (opcional)' })
  @IsNumber()
  @IsOptional()
  total?: number;

  @ApiProperty({ description: 'Fecha de vencimiento' })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  dueDate?: Date;

  @ApiProperty({ description: 'Notas adicionales' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ description: 'Metadata adicional' })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
