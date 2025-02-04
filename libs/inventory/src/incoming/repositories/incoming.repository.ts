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
        Storage: true,
      },
    });
  }

  async findWithStorageById(id: string): Promise<IncomingWithStorage> {
    return this.prisma.incoming.findFirst({
      where: {
        id,
      },
      include: {
        Storage: true,
      },
    });
  }

  //Evaluar donde seleccionar los registros activos
  async getAllDetailedIncoming(): Promise<DetailedIncoming[]> {
    return this.prisma.incoming.findMany({
      include: {
        Movement: {
          include: {
            Producto: {
              include: {
                Stock: {
                  include: {
                    Storage: {
                      select: {
                        name: true,
                      },
                    },
                  },
                },
              },
            },
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
        Movement: {
          include: {
            Producto: {
              include: {
                Stock: {
                  include: {
                    Storage: {
                      select: {
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
  }
}
