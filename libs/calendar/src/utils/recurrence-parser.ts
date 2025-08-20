import { Injectable, Logger } from '@nestjs/common';
import {
  addDays,
  eachWeekOfInterval,
  setHours,
  setMinutes,
  startOfDay,
  endOfDay,
  isValid,
  lastDayOfMonth,
} from 'date-fns';
import { formatInTimeZone, toDate } from 'date-fns-tz';
import { es } from 'date-fns/locale';

interface RecurrenceRule {
  frequency: string;
  interval: number;
  until: string;
}

const WEEKDAYS = {
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
  SUNDAY: 0,
};

const TIMEZONE = 'America/Lima';

@Injectable()
export class RecurrenceParser {
  private readonly logger = new Logger(RecurrenceParser.name);

  generateDates(
    startDate: Date,
    recurrenceRule: RecurrenceRule,
    daysOfWeek: string[],
  ): Date[] {
    try {
      this.logger.debug('Entrada de generateDates:', {
        startDate: startDate.toISOString(),
        recurrenceRule,
        daysOfWeek,
      });

      // Validar fecha inicial
      if (!isValid(startDate)) {
        throw new Error('Fecha inicial inválida');
      }

      // Parsear y validar fecha final
      const [year, month, day] = recurrenceRule.until.split('-').map(Number);
      let parsedUntilDate: Date;

      try {
        // Primero intentamos crear la fecha normalmente
        parsedUntilDate = new Date(year, month - 1, day);

        // Si la fecha no es válida (como 31 de febrero), usamos el último día del mes
        if (!isValid(parsedUntilDate)) {
          parsedUntilDate = lastDayOfMonth(new Date(year, month - 1, 1));
          this.logger.debug(
            `Fecha ajustada al último día del mes: ${parsedUntilDate.toISOString()}`,
          );
        }
      } catch (error) {
        throw new Error(
          `Error al procesar la fecha final: ${recurrenceRule.until}`,
        );
      }

      this.logger.debug('Fechas parseadas:', {
        parsedStartDate: startDate.toISOString(),
        parsedUntilDate: parsedUntilDate.toISOString(),
      });
      // Convertir fechas a la zona horaria correcta
      const localStartDate = toDate(startDate, { timeZone: TIMEZONE });
      const untilDate = toDate(endOfDay(parsedUntilDate), {
        timeZone: TIMEZONE,
      });

      this.logger.debug('Fechas en zona horaria local:', {
        localStartDate: formatInTimeZone(
          localStartDate,
          TIMEZONE,
          'yyyy-MM-dd HH:mm:ss',
          { locale: es },
        ),
        untilDate: formatInTimeZone(
          untilDate,
          TIMEZONE,
          'yyyy-MM-dd HH:mm:ss',
          { locale: es },
        ),
      });

      const weekDayNumbers = daysOfWeek.map((day) => WEEKDAYS[day]);
      const dates: Date[] = [];

      const weeks = eachWeekOfInterval({
        start: startOfDay(localStartDate),
        end: untilDate,
      }).filter((_, index) => index % recurrenceRule.interval === 0);

      this.logger.debug(`Generando fechas para ${weeks.length} semanas`);

      weeks.forEach((week) => {
        weekDayNumbers.forEach((dayNumber) => {
          const date = addDays(week, dayNumber);

          if (date >= localStartDate && date <= untilDate) {
            const eventDate = toDate(
              setMinutes(
                setHours(date, localStartDate.getHours()),
                localStartDate.getMinutes(),
              ),
              { timeZone: TIMEZONE },
            );

            if (isValid(eventDate)) {
              dates.push(eventDate);
              this.logger.debug(
                `Fecha agregada: ${formatInTimeZone(eventDate, TIMEZONE, 'yyyy-MM-dd HH:mm:ss')}`,
              );
            } else {
              this.logger.warn(`Fecha inválida generada para: ${date}`);
            }
          }
        });
      });
      this.logger.debug(`Total de fechas generadas: ${dates.length}`);

      return dates;
    } catch (error) {
      this.logger.error('Error en generateDates:', error);
      throw error;
    }
  }
}
