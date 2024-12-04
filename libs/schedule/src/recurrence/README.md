
```bash

# Modelo Recurrencia
Este modelo define cómo un calendario puede repetirse a lo largo del tiempo (semanal, mensual, etc.).

Campos:
calendarioId: Relaciona la recurrencia con un calendario específico.
frecuencia: Define la frecuencia de la recurrencia (DIARIA, SEMANAL, MENSUAL, ANUAL).
intervalo: Define el intervalo de repetición (por ejemplo, cada 1 semana, cada 2 meses, etc.).
fechaInicio: Cuándo empieza la recurrencia.
fechaFin: Opcionalmente, cuándo termina la recurrencia.
isActive: Marca si la recurrencia está activa o no.
Comentarios:
El modelo de recurrencia es muy útil para los calendarios que se repiten de manera regular. Puedes usarlo para generar automáticamente nuevos calendarios semanales o mensuales sin tener que crear un nuevo registro de calendario cada vez.
fechaFin es opcional, lo cual tiene sentido porque la recurrencia puede ser indefinida (por ejemplo, un calendario semanal que no tiene fecha de fin).

```
