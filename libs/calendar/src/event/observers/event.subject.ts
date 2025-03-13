/**
 * Enumeración de eventos relacionados con el calendario
 */
export enum CalendarEvents {
    EVENT_CREATED = 'calendar.event.created',
    EVENT_UPDATED = 'calendar.event.updated',
    EVENT_CANCELLED = 'calendar.event.cancelled',
    EVENT_COMPLETED = 'calendar.event.completed',
}

/**
 * Interfaz para la carga útil de eventos del calendario
 */
export interface CalendarEventPayload {
    eventId: string;
    metadata?: Record<string, any>;
}

