import {
  BadRequestException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '@prisma/prisma/prisma.service';
import {
  rolSuperAdminSeed,
  superAdminSeed,
  rolAdminSeed,
  adminSeed,
  ceciliaAdminSeed,
  doctorSeed,
  rolDoctorSeed,
} from './data/superadmin.seed';
import { handleException } from '@login/login/utils';
import * as bcrypt from 'bcrypt';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { modulesSeed } from './data/modules.seed';
import { permissionsSeed } from './data/permissions.seed';
import {
  BranchSeed,
  StorageTypeSeed,
  ServiceTypeSeed,
  CategoriaSeed,
  TipoProductoSeed,
  StaffTypeSeed,
} from './data/juanpablo.seed';

@Injectable()
export class SeedsService {
  private readonly logger = new Logger(SeedsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generar el usuario super admin con su rol
   * @returns Super admin creado
   */
  async generateInit(): Promise<HttpResponse<UserData>> {
    try {
      // Obtener todos los módulos y permisos actuales de la base de datos
      const existingModules = await this.prisma.module.findMany();
      const existingPermissions = await this.prisma.permission.findMany();

      // Iniciar una transacción
      const result = await this.prisma.$transaction(async (prisma) => {
        // Filtrar módulos que ya existen para solo agregar los nuevos
        const newModules = modulesSeed.filter(
          (module) =>
            !existingModules.some(
              (existingModule) => existingModule.cod === module.cod,
            ),
        );

        // Si hay nuevos módulos, insertarlos
        if (newModules.length > 0) {
          await prisma.module.createMany({
            data: newModules,
            skipDuplicates: true,
          });
        }

        // Filtrar permisos que ya existen para solo agregar los nuevos
        const newPermissions = permissionsSeed.filter(
          (permission) =>
            !existingPermissions.some(
              (existingPermission) => existingPermission.cod === permission.cod,
            ),
        );

        // Si hay nuevos permisos, insertarlos
        if (newPermissions.length > 0) {
          await prisma.permission.createMany({
            data: newPermissions,
            skipDuplicates: true,
          });
        }

        // Obtener la lista actualizada de módulos y permisos
        const updatedModulesList = await prisma.module.findMany();
        const updatedPermissionsList = await prisma.permission.findMany();

        // Crear o actualizar las relaciones entre módulos y permisos
        const modulePermissions = [];

        const specificPermissionsMap = new Map<string, string[]>(); // key: moduleId, value: permissionIds
        const generalPermissions = [];
        updatedPermissionsList.forEach((permission) => {
          const isSpecificPermission = updatedModulesList.some((module) =>
            permission.cod.includes(module.cod),
          );

          if (isSpecificPermission) {
            updatedModulesList.forEach((module) => {
              if (permission.cod.includes(module.cod)) {
                if (!specificPermissionsMap.has(module.id)) {
                  specificPermissionsMap.set(module.id, []);
                }
                specificPermissionsMap.get(module.id).push(permission.id);
              }
            });
          } else {
            generalPermissions.push(permission.id);
          }
        });

        // Asignar permisos generales a todos los módulos
        updatedModulesList.forEach((module) => {
          generalPermissions.forEach((permissionId) => {
            modulePermissions.push({
              moduleId: module.id,
              permissionId: permissionId,
            });
          });
        });

        // Asignar permisos específicos a módulos específicos
        specificPermissionsMap.forEach((permissionIds, moduleId) => {
          permissionIds.forEach((permissionId) => {
            modulePermissions.push({
              moduleId: moduleId,
              permissionId: permissionId,
            });
          });
        });

        // Crear o actualizar las relaciones entre módulos y permisos
        if (modulePermissions.length > 0) {
          await prisma.modulePermissions.createMany({
            data: modulePermissions,
            skipDuplicates: true,
          });
        }

        // Crear rol superadmin si no existe
        const superadminRole = await prisma.rol.upsert({
          where: {
            name_isActive: { name: rolSuperAdminSeed.name, isActive: true },
          },
          update: {},
          create: rolSuperAdminSeed,
        });

        // Asignar permisos del módulo al rol superadmin
        const allModulePermissions = await prisma.modulePermissions.findMany();
        const rolModulePermissionEntries = allModulePermissions.map(
          (modulePermission) => ({
            rolId: superadminRole.id,
            modulePermissionsId: modulePermission.id,
          }),
        );

        await prisma.rolModulePermissions.createMany({
          data: rolModulePermissionEntries,
          skipDuplicates: true,
        });

        // Crear usuario superadmin y asignarle el rol si no existe
        const superadminUser = await prisma.user.upsert({
          where: {
            email_isActive: { email: superAdminSeed.email, isActive: true },
          },
          update: {},
          create: {
            ...superAdminSeed,
            password: await bcrypt.hash(superAdminSeed.password, 10),
            isSuperAdmin: true,
            userRols: {
              create: {
                rolId: superadminRole.id,
              },
            },
          },
        });

        // Crear rol admin si no existe
        const adminRole = await prisma.rol.upsert({
          where: {
            name_isActive: { name: rolAdminSeed.name, isActive: true },
          },
          update: {},
          create: rolAdminSeed,
        });

        // Crear nuevas entradas de permisos para el rol admin
        const adminModulePermissionEntries = allModulePermissions.map(
          (modulePermission) => ({
            rolId: adminRole.id,
            modulePermissionsId: modulePermission.id,
          }),
        );

        // Asignar permisos del módulo al rol admin
        await prisma.rolModulePermissions.createMany({
          data: adminModulePermissionEntries,
          skipDuplicates: true,
        });

        // Crear usuario admin y asignarle el rol si no existe
        await prisma.user.upsert({
          where: {
            email_isActive: { email: adminSeed.email, isActive: true },
          },
          update: {},
          create: {
            ...adminSeed,
            password: await bcrypt.hash(adminSeed.password, 10),
            isSuperAdmin: false,
            userRols: {
              create: {
                rolId: adminRole.id,
              },
            },
          },
        });

        // Crear usuario Cecilia admin y asignarle el rol admin
        await prisma.user.upsert({
          where: {
            email_isActive: { email: ceciliaAdminSeed.email, isActive: true },
          },
          update: {},
          create: {
            ...ceciliaAdminSeed,
            password: await bcrypt.hash(ceciliaAdminSeed.password, 10),
            isSuperAdmin: false,
            userRols: {
              create: {
                rolId: adminRole.id,
              },
            },
          },
        });

        // Crear rol doctor si no existe
        const doctorRole = await prisma.rol.upsert({
          where: {
            name_isActive: { name: rolDoctorSeed.name, isActive: true },
          },
          update: {},
          create: rolDoctorSeed,
        });

        // Obtener solo los módulos relevantes para el doctor
        const doctorModules = [
          'CONSULTATIONS',
          'APPOINTMENTS',
          'PATIENTS',
          'MEDICAL_RECORDS',
          'PRESCRIPTIONS',
        ];

        // Filtrar los permisos de módulos para el doctor
        const doctorModulePermissions = allModulePermissions.filter((mp) => {
          const module = updatedModulesList.find((m) => m.id === mp.moduleId);
          return doctorModules.includes(module?.cod);
        });

        // Crear entradas de permisos para el rol doctor
        const doctorModulePermissionEntries = doctorModulePermissions.map(
          (modulePermission) => ({
            rolId: doctorRole.id,
            modulePermissionsId: modulePermission.id,
          }),
        );

        // Asignar permisos limitados al rol doctor
        await prisma.rolModulePermissions.createMany({
          data: doctorModulePermissionEntries,
          skipDuplicates: true,
        });

        // Crear usuario doctor y asignarle el rol
        await prisma.user.upsert({
          where: {
            email_isActive: { email: doctorSeed.email, isActive: true },
          },
          update: {},
          create: {
            ...doctorSeed,
            password: await bcrypt.hash(doctorSeed.password, 10),
            isSuperAdmin: false,
            userRols: {
              create: {
                rolId: doctorRole.id,
              },
            },
          },
        });

        // Crear las sucursales/branches desde el seed
        for (const branchData of BranchSeed) {
          // Primero buscar si existe la sucursal
          const existingBranch = await prisma.branch.findFirst({
            where: {
              name: branchData.name,
              isActive: true,
            },
          });

          if (existingBranch) {
            // Actualizar si existe
            await prisma.branch.update({
              where: { id: existingBranch.id },
              data: {
                address: branchData.address,
                phone: branchData.phone,
              },
            });
          } else {
            // Crear si no existe
            await prisma.branch.create({
              data: {
                ...branchData,
                isActive: true,
              },
            });
          }
        }
        this.logger.log('Branches created successfully');

        // Crear tipos de almacenamiento (Storage Types)
        for (const typeData of StorageTypeSeed) {
          const existingType = await prisma.typeStorage.findFirst({
            where: {
              name: typeData.name,
              isActive: true,
            },
          });

          if (existingType) {
            await prisma.typeStorage.update({
              where: { id: existingType.id },
              data: {
                description: typeData.description,
              },
            });
          } else {
            await prisma.typeStorage.create({
              data: {
                ...typeData,
                isActive: true,
              },
            });
          }
        }
        this.logger.log('Storage Types created successfully');

        // Crear tipos de servicio (Service Types)
        for (const typeData of ServiceTypeSeed) {
          const existingType = await prisma.serviceType.findFirst({
            where: {
              name: typeData.name,
              isActive: true,
            },
          });

          if (existingType) {
            await prisma.serviceType.update({
              where: { id: existingType.id },
              data: {
                description: typeData.description,
              },
            });
          } else {
            await prisma.serviceType.create({
              data: {
                ...typeData,
                isActive: true,
              },
            });
          }
        }
        this.logger.log('Service Types created successfully');

        // Crear categorías de productos
        for (const catData of CategoriaSeed) {
          const existingCat = await prisma.categoria.findFirst({
            where: {
              name: catData.name,
              isActive: true,
            },
          });

          if (existingCat) {
            await prisma.categoria.update({
              where: { id: existingCat.id },
              data: {
                description: catData.description,
              },
            });
          } else {
            await prisma.categoria.create({
              data: {
                ...catData,
                isActive: true,
              },
            });
          }
        }
        this.logger.log('Categories created successfully');

        // Crear tipos de productos
        for (const typeData of TipoProductoSeed) {
          const existingType = await prisma.tipoProducto.findFirst({
            where: {
              name: typeData.name,
              isActive: true,
            },
          });

          if (existingType) {
            await prisma.tipoProducto.update({
              where: { id: existingType.id },
              data: {
                description: typeData.description,
              },
            });
          } else {
            await prisma.tipoProducto.create({
              data: {
                ...typeData,
                isActive: true,
              },
            });
          }
        }
        this.logger.log('Product Types created successfully');

        // Crear tipos de personal (Staff Types)
        for (const typeData of StaffTypeSeed) {
          const existingType = await prisma.staffType.findFirst({
            where: {
              name: typeData.name,
              isActive: true,
            },
          });

          if (existingType) {
            await prisma.staffType.update({
              where: { id: existingType.id },
              data: {
                description: typeData.description,
              },
            });
          } else {
            await prisma.staffType.create({
              data: {
                ...typeData,
                isActive: true,
              },
            });
          }
        }
        this.logger.log('Staff Types created successfully');

        return {
          message: 'Super admin created successfully',
          statusCode: HttpStatus.CREATED,
          data: {
            id: superadminUser.id,
            name: superadminUser.name,
            email: superadminUser.email,
            phone: superadminUser.phone,
            isSuperAdmin: superadminUser.isSuperAdmin,
            roles: [
              {
                id: superadminRole.id,
                name: superadminRole.name,
              },
            ],
          },
        };
      });

      return result;
    } catch (error) {
      this.logger.error(
        `Error generating super admin ${superAdminSeed.email}`,
        error.stack,
      );
      if (error instanceof BadRequestException) {
        throw error;
      }
      handleException(error, 'Error generating super admin');
    }
  }
}
