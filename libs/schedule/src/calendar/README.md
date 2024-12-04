
```bash

# Modelo Calendario
Este modelo organiza el cronograma del empleado y tiene la relación directa con los eventos y la recurrencia.

Campos:
personalId: Relaciona al calendario con un empleado específico (via Personal).
sucursalId: Relaciona el calendario con una sucursal.
nombre: Permite identificar el calendario, como "Horario Normal" o "Horario Verano".
color: Ayuda a visualizar el calendario con diferentes colores.
isDefault: Indica si es el calendario predeterminado para ese empleado.
isActive: Marca si el calendario está activo o no.
eventos: Relación con los eventos que conforman el cronograma diario del empleado.
recurrencia: Relación con las reglas de recurrencia (repetición automática de este calendario).
La estructura parece correcta, con una relación adecuada entre Calendario y Evento, y la posibilidad de gestionar la recurrencia del calendario.




```
