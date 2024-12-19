export class Appointment {
  id: string;
  pacienteId: string;
  personalId: string;
  tipoCitaId: string;
  fecha: Date;
  motivo?: string;
  estado: string; // PENDIENTE, CONFIRMADA, CANCELADA, COMPLETADA
  observaciones?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
