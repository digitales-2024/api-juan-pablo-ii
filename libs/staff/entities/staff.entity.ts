export class Staff {
  id: string;
  especialidadId: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  lastName: string;
  dni: string;
  birth: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// especialidad.entity.ts
export class Specialization {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}
