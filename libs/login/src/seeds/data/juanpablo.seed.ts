export interface Branch {
  name: string;
  address: string;
  phone: string;
}

export const BranchSeed: Branch[] = [
  {
    name: 'JLBYR',
    address: 'av. Peru 123',
    phone: '+51987654321',
  },
  {
    name: 'Yanahuara',
    address: 'Urb Valencia Mz.3 Lt.13 ',
    phone: '+5112345678',
  },
];

export interface TypeStorage {
  name: string;
  description: string;
}

export const StorageTypeSeed: TypeStorage[] = [
  {
    name: 'VENTA',
    description: 'Tipo de almacenamiento para venta',
  },
  {
    name: 'INTERNO',
    description: 'Tipo de almacenamiento interno',
  },
];

export interface ServiceType {
  name: string;
  description: string;
}

export const ServiceTypeSeed: ServiceType[] = [
  {
    name: 'Consultas',
    description: 'Tipo de servicio de consulta',
  },
  {
    name: 'Tratamientos',
    description: 'Tipo de servicio de tratamiento',
  },
  {
    name: 'Aplicaciones',
    description: 'Tipo de servicio de aplicaciones',
  },
  {
    name: 'Controles',
    description: 'Tipo de servicio de controles',
  },
];

export interface Categoria {
  name: string;
  description: string;
}
export const CategoriaSeed: Categoria[] = [
  {
    name: 'Productos inyectables',
    description:
      'Sustancias utilizadas en tratamientos estéticos como botox y ácido hialurónico.',
  },
  {
    name: 'Material desechable',
    description:
      'Productos de un solo uso necesarios para procedimientos médicos.',
  },
  {
    name: 'Cremas',
    description:
      'Productos dermatológicos y cosméticos para el cuidado de la piel.',
  },
];

export interface TipoProducto {
  name: string;
  description: string;
}

export const TipoProductoSeed: TipoProducto[] = [
  {
    name: 'Inyectables',
    description:
      'Productos líquidos o en gel utilizados en tratamientos estéticos, como ácido hialurónico y toxina botulínica.',
  },
  {
    name: 'Material desechable',
    description:
      'Productos de un solo uso utilizados en procedimientos, como guantes, jeringas y gasas.',
  },
  {
    name: 'Cosmecéuticos',
    description:
      'Cremas, geles y sueros con propiedades dermatológicas para el cuidado de la piel.',
  },
  {
    name: 'Equipos y dispositivos',
    description:
      'Máquinas y herramientas utilizadas en tratamientos estéticos, como láser y radiofrecuencia.',
  },
  {
    name: 'Suplementos y nutricosméticos',
    description:
      'Vitaminas y complementos nutricionales diseñados para mejorar la salud de la piel, cabello y uñas.',
  },
  {
    name: 'Productos post-tratamiento',
    description:
      'Productos recomendados para el cuidado posterior a procedimientos estéticos, como cremas regenerativas o calmantes.',
  },
];

export interface StaffType {
  name: string;
  description: string;
}

export const StaffTypeSeed: StaffType[] = [
  {
    name: 'Medico',
    description: 'Tipo de personal medico',
  },
  {
    name: 'Administrativo',
    description: 'Tipo de personal administrativo',
  },
  {
    name: 'Almacenero',
    description: 'Tipo de personal de almacén',
  },
  {
    name: 'Enfermero',
    description: 'Tipo de personal de enfermería',
  },
  {
    name: 'Operario',
    description: 'Tipo de personal de operación',
  },
];
