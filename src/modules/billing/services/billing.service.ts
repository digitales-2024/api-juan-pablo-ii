import { Injectable } from '@nestjs/common';
import { UserData } from '@login/login/interfaces';
import { OrderService } from '@pay/pay/services/order.service';
import { BaseErrorHandler } from 'src/common/error-handlers/service-error.handler';
import { MedicalConsultationGenerator } from '../generators/medical-consultation.generator';
import { CreateMedicalConsultationOrderUseCase } from '../use-cases/create-medical-consultation-billing.use-case';
import { CreateMedicalConsultationBillingDto } from '../dto/create-medical-consultation-billing.dto';

@Injectable()
export class BillingService {
  private readonly errorHandler: BaseErrorHandler;

  constructor(
    private readonly orderService: OrderService,
    private readonly medicalConsultationGenerator: MedicalConsultationGenerator,
    private readonly createServiceBillingUseCase: CreateMedicalConsultationOrderUseCase,
  ) {
    this.orderService.registerGenerator(this.medicalConsultationGenerator);
  }

  async createServiceBilling(
    dto: CreateMedicalConsultationBillingDto,
    user: UserData,
  ) {
    try {
      await this.createServiceBillingUseCase.execute(dto, user);
    } catch (error) {
      this.errorHandler.handleError(error, 'creating');
    }
  }
}
