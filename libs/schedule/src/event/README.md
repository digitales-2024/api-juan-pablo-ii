
```bash

# Modelo Evento
Cada evento representa una actividad específica (como "Ingreso", "Almuerzo", "Salida", etc.) en un día determinado.

Campos:
calendarioId: Relaciona el evento con un calendario específico.
titulo: El tipo de evento (Ingreso, Almuerzo, Salida, Descanso, Permiso, etc.).
descripcion: Descripción opcional del evento.
fechaInicio y fechaFin: Las horas específicas de inicio y fin del evento.
todoElDia: Indica si el evento cubre todo el día (por ejemplo, un descanso de todo el día).
tipo: Define el tipo del evento (Ingreso, Salida, Almuerzo, Descanso, Permiso).
color: Permite diferenciar visualmente el evento en el calendario.
esPermiso: Indica si el evento corresponde a un permiso (booleano).
tipoPermiso: Si el evento es un permiso, define el tipo (Ej. Médico, Personal, Vacaciones, etc.).
estadoPermiso: Controla el estado del permiso (Pendiente, Aprobado, Rechazado).
isActive: Marca si el evento está activo o no.
createdAt y updatedAt: Para registrar la fecha de creación y actualización del evento.
Comentarios:
El uso del campo isActive es útil para poder desactivar eventos cuando sea necesario sin eliminarlos.
La relación entre Calendario y Evento es crucial para poder ver cómo se distribuyen los eventos a lo largo de la semana



```
