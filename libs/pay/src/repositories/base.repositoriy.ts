import { Injectable } from '@nestjs/common';
import { BaseRepository, PrismaService } from '@prisma/prisma';
import { OrderType, OrderStatus } from '../interfaces/order.types';

@Injectable()
export abstract class PayBaseRepository<
  T extends { id: string },
> extends BaseRepository<T> {
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly modelName: keyof PrismaService,
  ) {
    super(prisma, modelName);
  }

  /**
   * Sobreescribe el método para mapear correctamente los enums de Order
   */
  protected override mapDtoToEntity(dto: any): any {
    const mappedDto = { ...dto };

    // Manejar el mapeo específico para Orders
    if (this.modelName === 'order') {
      // Mapear type si existe
      if (mappedDto.type) {
        mappedDto.type = this.mapOrderType(mappedDto.type);
      }

      // Mapear status si existe
      if (mappedDto.status) {
        mappedDto.status = this.mapOrderStatus(mappedDto.status);
      }

      // Asegurarse que metadata y details sean objetos JSON válidos
      if (mappedDto.metadata && typeof mappedDto.metadata !== 'string') {
        mappedDto.metadata = JSON.stringify(mappedDto.metadata);
      }

      if (mappedDto.details && typeof mappedDto.details !== 'string') {
        mappedDto.details = JSON.stringify(mappedDto.details);
      }

      if (mappedDto.services && typeof mappedDto.services !== 'string') {
        mappedDto.services = JSON.stringify(mappedDto.services);
      }
    }

    return mappedDto;
  }

  /**
   * Mapea los tipos de orden a los valores del enum
   */
  private mapOrderType(type: string | OrderType): OrderType {
    if (typeof type === 'string' && type in OrderType) {
      return OrderType[type as keyof typeof OrderType];
    }
    return type as OrderType;
  }

  /**
   * Mapea los estados de orden a los valores del enum
   */
  private mapOrderStatus(status: string | OrderStatus): OrderStatus {
    if (typeof status === 'string' && status in OrderStatus) {
      return OrderStatus[status as keyof typeof OrderStatus];
    }
    return status as OrderStatus;
  }

  /**
   * Encuentra órdenes por estado
   */
  async findByPaymentStatus(status: OrderStatus): Promise<T[]> {
    return this.findMany({
      where: { status },
      include: {
        payments: true,
      },
    });
  }

  /**
   * Encuentra órdenes por tipo
   */
  async findByOrderType(type: OrderType): Promise<T[]> {
    return this.findMany({
      where: { type },
      include: {
        payments: true,
      },
    });
  }

  /**
   * Encuentra órdenes por referencia
   */
  async findByReference(referenceId: string): Promise<T[]> {
    return this.findMany({
      where: { referenceId },
      include: {
        payments: true,
      },
    });
  }

  /**
   * Sobreescribe el método create para manejar la transformación de datos
   */
  override async create(createDto: any): Promise<T> {
    const mappedData = this.mapDtoToEntity(createDto);

    return this.prisma.measureQuery(`create${String(this.modelName)}`, () =>
      (this.prisma[this.modelName] as any).create({
        data: mappedData,
      }),
    );
  }

  /**
   * Sobreescribe el método update para manejar la transformación de datos
   */
  override async update(id: string, updateDto: any): Promise<T> {
    const mappedData = this.mapDtoToEntity(updateDto);

    return this.prisma.measureQuery(`update${String(this.modelName)}`, () =>
      (this.prisma[this.modelName] as any).update({
        where: { id },
        data: mappedData,
      }),
    );
  }
}
