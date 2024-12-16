// src/modules/billing/generators/service-billing.generator.ts
import { Injectable } from '@nestjs/common';
import { BaseOrderGenerator } from '@pay/pay/generators/base-order.generator';
import { IOrder } from '@pay/pay/interfaces';

// Interfaces para simular respuestas de otros servicios
interface ConsultaData {
  id: string;
  tipo: string;
  doctorId: string;
  pacienteId: string;
  fecha: Date;
  estado: string;
}

interface ServicePrice {
  price: number;
  currency: string;
}

interface ServiceBillingInput {
  consultaId: string;
}

@Injectable()
export class ServiceBillingGenerator extends BaseOrderGenerator {
  type = 'SERVICE_BILLING';

  // Simulando servicio de consultas
  private async mockConsultaService(consultaId: string): Promise<ConsultaData> {
    // Datos mockeados de consulta
    return {
      id: consultaId,
      tipo: 'CONSULTA_GENERAL',
      doctorId: 'doctor-123',
      pacienteId: 'paciente-456',
      fecha: new Date(),
      estado: 'COMPLETADA',
    };
  }

  // Simulando servicio de precios
  private async mockServicePriceService(
    tipoConsulta: string,
  ): Promise<ServicePrice> {
    // Precios mockeados según tipo de consulta
    const precios = {
      CONSULTA_GENERAL: 100,
      CONSULTA_ESPECIALIDAD: 150,
      CONSULTA_URGENCIA: 200,
    };

    return {
      price: precios[tipoConsulta] || 100,
      currency: 'USD',
    };
  }

  async generate(input: ServiceBillingInput): Promise<IOrder> {
    const total = await this.calculateTotal(input);
    const consulta = await this.mockConsultaService(input.consultaId);

    return {
      type: this.type,
      referenceId: input.consultaId,
      status: 'PENDING',
      details: {
        tipoConsulta: consulta.tipo,
        doctorId: consulta.doctorId,
        pacienteId: consulta.pacienteId,
        fechaConsulta: consulta.fecha,
        estado: consulta.estado,
      },
      services: [
        {
          id: `service-${consulta.id}`,
          name: 'Consulta General',
          price: total,
        },
      ],
      total,
      date: new Date(),
      description: `Orden de pago para consulta médica ${consulta.tipo}`,
    };
  }

  async calculateTotal(input: ServiceBillingInput): Promise<number> {
    const consulta = await this.mockConsultaService(input.consultaId);
    const priceInfo = await this.mockServicePriceService(consulta.tipo);
    return priceInfo.price;
  }
}
