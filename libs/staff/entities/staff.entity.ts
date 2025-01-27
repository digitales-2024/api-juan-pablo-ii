export class Staff {
  id: string;
  staffTypeId: string;
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


export class StaffType {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
