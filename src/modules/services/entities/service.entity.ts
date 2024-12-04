/**
 * Entidad que representa un servicio médico
 * @class Service
 */
export class Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  serviceTypeId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Entidad que representa un tipo de servicio médico
 * @class ServiceType
 */
export class ServiceType {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
