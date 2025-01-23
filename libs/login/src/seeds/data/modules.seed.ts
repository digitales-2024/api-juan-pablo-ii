import { Module } from '@login/login/interfaces';

export const modulesSeed: Module[] = [
  // General
  {
    cod: 'DASHBOARD',
    name: 'Dashboard',
    description: 'Módulo de Dashboard',
  },

  // Citas y Consultas
  {
    cod: 'CONSULTATIONS',
    name: 'Consultas',
    description: 'Gestión de consultas médicas',
  },
  {
    cod: 'APPOINTMENTS',
    name: 'Citas',
    description: 'Gestión de citas médicas',
  },

  // Clientes y Pacientes
  {
    cod: 'CLIENTS',
    name: 'Clientes',
    description: 'Gestión de clientes',
  },
  {
    cod: 'PATIENTS',
    name: 'Pacientes',
    description: 'Gestión de pacientes',
  },
  {
    cod: 'MEDICAL_RECORDS',
    name: 'Registros médicos',
    description: 'Gestión de historias clínicas',
  },
  {
    cod: 'PRESCRIPTIONS',
    name: 'Prescripciones',
    description: 'Gestión de recetas médicas',
  },

  // Ventas y Pagos
  {
    cod: 'ORDERS',
    name: 'Ordenes',
    description: 'Gestión de órdenes',
  },
  {
    cod: 'PAYMENTS',
    name: 'Pagos',
    description: 'Gestión de pagos',
  },

  // Inventario
  {
    cod: 'STOCK',
    name: 'Stock',
    description: 'Gestión de inventario',
  },
  {
    cod: 'ENTRIES',
    name: 'Entradas',
    description: 'Registro de entradas de productos',
  },
  {
    cod: 'EXITS',
    name: 'Salidas',
    description: 'Registro de salidas de productos',
  },

  // Personal y Horarios
  {
    cod: 'STAFF',
    name: 'Personal',
    description: 'Gestión del personal',
  },
  {
    cod: 'TIMETABLE',
    name: 'Cronograma',
    description: 'Gestión de cronogramas',
  },
  {
    cod: 'SCHEDULES',
    name: 'Horarios',
    description: 'Gestión de horarios',
  },

  // Catálogo
  {
    cod: 'PRODUCTS',
    name: 'Productos',
    description: 'Gestión de productos',
  },
  {
    cod: 'CATEGORIES',
    name: 'Categorías',
    description: 'Gestión de categorías de productos',
  },
  {
    cod: 'TYPES',
    name: 'Tipos',
    description: 'Gestión de tipos de productos',
  },
  {
    cod: 'SERVICES',
    name: 'Servicios',
    description: 'Gestión de servicios',
  },
  {
    cod: 'BRANCHES',
    name: 'Sucursales',
    description: 'Gestión de sucursales',
  },

  // Administración
  {
    cod: 'USERS',
    name: 'Usuarios',
    description: 'Gestión de usuarios',
  },
  {
    cod: 'ROLES',
    name: 'Roles',
    description: 'Gestión de roles',
  },
  {
    cod: 'PERMISSIONS',
    name: 'Permisos',
    description: 'Gestión de permisos',
  },
];
