import { Injectable } from '@nestjs/common';
import { BaseRepository, PrismaService } from '@prisma/prisma';
import { TimeOff } from '../entities/time-off.entity';

@Injectable()
export class TimeOffRepository extends BaseRepository<TimeOff> {
  constructor(prisma: PrismaService) {
    super(prisma, 'timeOff');
  }

  async findActiveTimeOffs(staffId: string, start: Date, end: Date): Promise<TimeOff[]> {
    return this.findMany({
      where: {
        staffId,
        start: { lte: end },
        end: { gte: start },
        isActive: true
      }
    });
  }

  async findConflictingTimeOffs(
    staffId: string,
    start: Date,
    end: Date,
  ): Promise<TimeOff[]> {
    return this.findMany({
      where: {
        staffId,
        isActive: true,
        OR: [
          // Caso 1: Nueva ausencia comienza durante una existente
          {
            start: { lte: start },
            end: { gte: start },
          },
          // Caso 2: Nueva ausencia termina durante una existente
          {
            start: { lte: end },
            end: { gte: end },
          },
          // Caso 3: Nueva ausencia engloba completamente una existente
          {
            start: { gte: start },
            end: { lte: end },
          },
        ],
      },
    });
  }


  }

//   async deleteTimeOffAndRegenerateEvents(timeOffId: string): Promise<{ timeOff: TimeOff; regeneratedEvents: Event[] }> {
//     return this.prisma.$transaction(async (tx) => {
//       // 1. Eliminar la ausencia
//       const deletedTimeOff = await tx.timeOff.delete({ where: { id: timeOffId } });
      
//       // 2. Regenerar eventos afectados (lógica específica)
//       const regeneratedEvents = await this.regenerateAffectedEvents(deletedTimeOff, tx);
      
//       return { timeOff: deletedTimeOff, regeneratedEvents };
//     });
//   }

//   private async regenerateAffectedEvents(timeOff: TimeOff, tx: any): Promise<Event[]> {
//     // Lógica para regenerar eventos basada en los horarios afectados
//     const schedules = await tx.staffSchedule.findMany({
//       where: { staffId: timeOff.staffId }
//     });

//     const newEvents = [];
//     // Aquí implementarías la lógica de regeneración...
//     return newEvents;
//   }
