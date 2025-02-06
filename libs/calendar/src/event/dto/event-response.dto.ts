import { Expose } from 'class-transformer';
import { EventType } from '../entities/event-type.enum';

export class EventResponseDto {
    // Campos de identificación
    @Expose()
    id: string;

    @Expose()
    title: string;

    @Expose()
    type: EventType;

    // Campos de estado
    @Expose()
    status: string;

    @Expose()
    color: string;

    @Expose()
    isActive: boolean;

    @Expose()
    isCancelled: boolean;

    // Campos de relación
    @Expose()
    staffId: string;

    @Expose()
    branchId: string;

    @Expose()
    staffScheduleId: string;

    // Campos de recurrencia
    @Expose()
    isBaseEvent: boolean;

    @Expose()
    recurrence: string;

    @Expose()
    exceptionDates: Date[];

    @Expose()
    cancellationReason: string;

    // Fechas UTC (como se guardan en BD)
    @Expose()
    start: string;

    @Expose()
    end: string;

    @Expose()
    createdAt: Date;

    @Expose()
    updatedAt: Date;

  }