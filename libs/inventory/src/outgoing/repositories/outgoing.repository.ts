import { Injectable } from '@nestjs/common';
import { BaseRepository, PrismaService } from '@prisma/prisma';
import { DetailedOutgoing, Outgoing } from '../entities/outgoing.entity';

@Injectable()
export class OutgoingRepository extends BaseRepository<Outgoing> {
  constructor(prisma: PrismaService) {
    super(prisma, 'outgoing'); // Tabla del esquema de prisma
  }

  //Evaluar donde seleccionar los registros activos
  async getAllDetailedOutgoing(): Promise<DetailedOutgoing[]> {
    return this.prisma.outgoing.findMany({
      include: {
        Storage: {
          select: {
            name: true,
          },
        },
        Movement: {
          include: {
            Producto: true,
          },
        },
      },
    });
  }

  async findDetailedOutgoingById(id: string): Promise<DetailedOutgoing> {
    return this.prisma.outgoing.findFirst({
      where: {
        id,
      },
      include: {
        Storage: {
          select: {
            name: true,
          },
        },
        Movement: {
          include: {
            Producto: true,
          },
        },
      },
    });
  }
}
