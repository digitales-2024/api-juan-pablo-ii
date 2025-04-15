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

  /**
   * Obtiene todos los ingresos con detalles completos, opcionalmente filtrados por sucursal
   * @param branchFilter - Filtro opcional de sucursal
   * @returns Lista de ingresos con detalles
   */
  async getAllDetailedIncoming(
    branchFilter: any = {},
  ): Promise<DetailedIncoming[]> {
    return this.prisma.incoming.findMany({
      where: {
        isActive: true, // Solo obtener registros activos
        ...branchFilter, // Aplicar filtro de sucursal si existe
      },
      orderBy: {
        createdAt: 'desc', // Ordenar del más reciente al más antiguo
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
