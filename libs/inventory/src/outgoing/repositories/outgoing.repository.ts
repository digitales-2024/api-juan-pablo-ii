import { Injectable } from '@nestjs/common';
import { BaseRepository, PrismaService } from '@prisma/prisma';
import {
  DetailedOutgoing,
  Outgoing,
  OutgoingWithStorage,
} from '../entities/outgoing.entity';

@Injectable()
export class OutgoingRepository extends BaseRepository<Outgoing> {
  constructor(prisma: PrismaService) {
    super(prisma, 'outgoing'); // Tabla del esquema de prisma
  }

  async getAllWithStorage(): Promise<OutgoingWithStorage[]> {
    return this.prisma.outgoing.findMany({
      include: {
        Storage: {
          select: {
            id: true,
            name: true,
            TypeStorage: {
              select: {
                id: true,
                name: true,
              },
            },
            branch: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
  }

  async findWithStorageById(id: string): Promise<OutgoingWithStorage> {
    return this.prisma.outgoing.findFirst({
      where: {
        id,
      },
      include: {
        Storage: {
          select: {
            id: true,
            name: true,
            TypeStorage: {
              select: {
                id: true,
                name: true,
              },
            },
            branch: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
  }

  //Evaluar donde seleccionar los registros activos
  async getAllDetailedOutgoing(): Promise<DetailedOutgoing[]> {
    return this.prisma.outgoing.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        Storage: {
          select: {
            id: true,
            name: true,
            TypeStorage: {
              select: {
                id: true,
                name: true,
              },
            },
            branch: {
              select: {
                id: true,
                name: true,
              },
            },
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
            id: true,
            name: true,
            TypeStorage: {
              select: {
                id: true,
                name: true,
              },
            },
            branch: {
              select: {
                id: true,
                name: true,
              },
            },
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

  async findManyDetailedOutgoingById(
    ids: string[],
  ): Promise<DetailedOutgoing[]> {
    return this.prisma.outgoing.findMany({
      where: {
        id: {
          in: ids,
        },
      },
      include: {
        Storage: {
          select: {
            id: true,
            name: true,
            TypeStorage: {
              select: {
                id: true,
                name: true,
              },
            },
            branch: {
              select: {
                id: true,
                name: true,
              },
            },
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
