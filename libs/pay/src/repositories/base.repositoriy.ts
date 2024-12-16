import { Injectable } from '@nestjs/common';
import { PrismaBaseRepository, PrismaService } from '@prisma/prisma';

@Injectable()
export abstract class PayBaseRepository<
  T extends { id: string },
> extends PrismaBaseRepository<T> {
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly modelName: keyof PrismaService,
  ) {
    super(prisma, modelName);
  }

  async findByPaymentStatus(status: string): Promise<T[]> {
    return this.findMany({
      where: { status },
      include: {
        payments: true,
      },
    });
  }
}
