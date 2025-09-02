# 🔧 Submódulo Utils - Documentación Técnica

## 🎯 Descripción General

El submódulo **Utils** proporciona **utilidades y herramientas** para el manejo de fechas, recurrencia y cálculos temporales en el sistema de calendario. Incluye el `RecurrenceParser` que es fundamental para la generación de eventos recurrentes basados en horarios de staff y reglas de recurrencia complejas.

## 🏗️ Arquitectura del Submódulo

### Estructura de Directorios
```
📁 libs/calendar/src/utils/
├── recurrence-parser.ts   # Parser de reglas de recurrencia
└── README.md             # Esta documentación
```

### Patrón Arquitectónico
- Utility Pattern para funciones específicas
- Parser Pattern para procesamiento de reglas
- Manejo robusto de zonas horarias
- Validación de fechas y reglas de recurrencia

## 🔧 Dependencias del Submódulo

### Externas
- `@nestjs/common` (para logging)
- `date-fns` (manejo de fechas)
- `date-fns-tz` (conversión de zonas horarias)
- `date-fns/locale` (localización en español)

## 📊 Modelos de Datos

### Interface: `RecurrenceRule`
```typescript
interface RecurrenceRule {
  frequency: string;    // 'DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'
  interval: number;     // Intervalo de repetición
  until: string;        // Fecha final (YYYY-MM-DD)
}
```

### Constantes
```typescript
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
```

## 🧾 Tipados (Interfaces, Enums y DTOs)

### Interfaces Principales

Origen: `libs/calendar/src/utils/recurrence-parser.ts`

```typescript
interface RecurrenceRule {
  frequency: string;
  interval: number;
  until: string;
}
```

### Métodos Principales

```typescript
class RecurrenceParser {
  generateDates(
    startDate: Date,
    recurrenceRule: RecurrenceRule,
    daysOfWeek: string[],
  ): Date[]
}
```

## 🚀 Funcionalidades Principales

### `RecurrenceParser`

#### Propósito
Genera fechas recurrentes basadas en reglas de recurrencia, días de la semana y excepciones. Es fundamental para la creación automática de eventos recurrentes desde horarios de staff.

#### Método Principal: `generateDates`

```typescript
generateDates(
  startDate: Date,
  recurrenceRule: RecurrenceRule,
  daysOfWeek: string[],
): Date[]
```

**Parámetros:**
- `startDate`: Fecha de inicio para la recurrencia
- `recurrenceRule`: Regla de recurrencia con frecuencia, intervalo y fecha final
- `daysOfWeek`: Array de días de la semana (ej: ['MONDAY', 'WEDNESDAY', 'FRIDAY'])

**Retorna:**
- Array de fechas generadas según las reglas de recurrencia

#### Flujo de Procesamiento

1. **Validación de Fecha Inicial**
   ```typescript
   if (!isValid(startDate)) {
     throw new Error('Fecha inicial inválida');
   }
   ```

2. **Parseo de Fecha Final**
   ```typescript
   const [year, month, day] = recurrenceRule.until.split('-').map(Number);
   let parsedUntilDate: Date;
   ```

3. **Manejo de Fechas Inválidas**
   ```typescript
   if (!isValid(parsedUntilDate)) {
     parsedUntilDate = lastDayOfMonth(new Date(year, month - 1, 1));
   }
   ```

4. **Conversión de Zona Horaria**
   ```typescript
   const localStartDate = toDate(startDate, { timeZone: TIMEZONE });
   const untilDate = toDate(endOfDay(parsedUntilDate), { timeZone: TIMEZONE });
   ```

5. **Generación de Fechas**
   ```typescript
   const weekDayNumbers = daysOfWeek.map((day) => WEEKDAYS[day]);
   const weeks = eachWeekOfInterval({
     start: startOfDay(localStartDate),
     end: untilDate,
   }).filter((_, index) => index % recurrenceRule.interval === 0);
   ```

6. **Aplicación de Días de la Semana**
   ```typescript
   weeks.forEach((week) => {
     weekDayNumbers.forEach((dayNumber) => {
       const date = addDays(week, dayNumber);
       if (date >= localStartDate && date <= untilDate) {
         // Crear fecha del evento con hora original
         const eventDate = toDate(
           setMinutes(
             setHours(date, localStartDate.getHours()),
             localStartDate.getMinutes(),
           ),
           { timeZone: TIMEZONE },
         );
         dates.push(eventDate);
       }
     });
   });
   ```

## 📏 Reglas y Validaciones

### Validaciones de Fechas
- **Fecha Inicial**: Debe ser una fecha válida
- **Fecha Final**: Se parsea y valida, con fallback al último día del mes
- **Rango**: Las fechas generadas deben estar dentro del rango válido

### Reglas de Recurrencia
- **Frecuencia**: Soporte para patrones semanales
- **Intervalo**: Aplicación del intervalo de repetición
- **Días de la Semana**: Filtrado por días específicos
- **Zona Horaria**: Conversión correcta a `America/Lima`

### Manejo de Errores
- **Fechas Inválidas**: Manejo de fechas como 31 de febrero
- **Parseo de Reglas**: Validación de formato de reglas
- **Logs Detallados**: Para debugging y monitoreo

## 🧪 Testing Recomendado
- Unit: generación de fechas con diferentes reglas
- Integration: con horarios de staff
- Edge Cases: fechas inválidas, reglas complejas
- Performance: generación de muchas fechas

## 🚨 Manejo de Errores
- Validación de fechas de entrada
- Manejo de fechas inválidas en reglas
- Logs detallados para debugging
- Fallbacks para casos edge

## 🔧 Configuración
Variables sugeridas:
```env
CALENDAR_TIMEZONE=America/Lima
CALENDAR_LOCALE=es
CALENDAR_MAX_RECURRENCE_YEARS=5
```

## 🔗 Integraciones
- **Events**: Generación de eventos recurrentes
- **Staff Schedule**: Procesamiento de horarios
- **Date-fns**: Manejo de fechas y zonas horarias

## 📈 Casos de Uso

### Generación de Turnos Semanales
```typescript
const recurrenceRule = {
  frequency: 'WEEKLY',
  interval: 1,
  until: '2024-12-31'
};

const daysOfWeek = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];

const dates = recurrenceParser.generateDates(startDate, recurrenceRule, daysOfWeek);
```

### Generación de Citas Mensuales
```typescript
const recurrenceRule = {
  frequency: 'WEEKLY',
  interval: 4, // Cada 4 semanas = mensual
  until: '2024-06-30'
};

const daysOfWeek = ['TUESDAY']; // Solo los martes

const dates = recurrenceParser.generateDates(startDate, recurrenceRule, daysOfWeek);
```

### Manejo de Excepciones
```typescript
// Las excepciones se manejan en el nivel superior (Events)
// Este parser solo genera las fechas base
const dates = recurrenceParser.generateDates(startDate, recurrenceRule, daysOfWeek);

// Luego se filtran las excepciones
const filteredDates = dates.filter(date => {
  const dateString = formatInTimeZone(date, 'America/Lima', 'yyyy-MM-dd');
  return !exceptions.includes(dateString);
});
```

## 🔍 Logging y Debugging

### Logs de Entrada
```typescript
this.logger.debug('Entrada de generateDates:', {
  startDate: startDate.toISOString(),
  recurrenceRule,
  daysOfWeek,
});
```

### Logs de Procesamiento
```typescript
this.logger.debug('Fechas parseadas:', {
  parsedStartDate: startDate.toISOString(),
  parsedUntilDate: parsedUntilDate.toISOString(),
});
```

### Logs de Salida
```typescript
this.logger.debug(`Total de fechas generadas: ${dates.length}`);
```

## 📊 Métricas y Performance
- **Tiempo de Procesamiento**: Monitoreo de generación de fechas
- **Cantidad de Fechas**: Control de límites para evitar sobrecarga
- **Memoria**: Optimización para grandes volúmenes de fechas

---

Documentación del submódulo Utils - Sistema API Juan Pablo II
