import { Injectable } from '@nestjs/common';
import { BaseRepository, PrismaService } from '@prisma/prisma';
import {
  DetailedIncoming,
  Incoming,
  IncomingWithStorage,
} from '../entities/incoming.entity';

@Injectable()
export class IncomingRepository extends BaseRepository<Incoming> {
  constructor(prisma: PrismaService) {
    super(prisma, 'incoming'); // Tabla del esquema de prisma
  }

  async getAllWithStorage(): Promise<IncomingWithStorage[]> {
    return this.prisma.incoming.findMany({
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

  async findWithStorageById(id: string): Promise<IncomingWithStorage> {
    return this.prisma.incoming.findFirst({
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
  async getAllDetailedIncoming(): Promise<DetailedIncoming[]> {
    return this.prisma.incoming.findMany({
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

  async findDetailedIncomingById(id: string): Promise<DetailedIncoming> {
    return this.prisma.incoming.findFirst({
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

  async findManyDetailedIncomingById(
    ids: string[],
  ): Promise<DetailedIncoming[]> {
    return this.prisma.incoming.findMany({
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
