// src/modules/billing/dto/create-service-billing.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsUUID,
  IsOptional,
  IsNumber,
  IsString,
  IsObject,
} from 'class-validator';

export class CreateMedicalConsultationBillingDto {
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

  @ApiProperty({ description: 'Notas adicionales' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ description: 'Metadata adicional' })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}