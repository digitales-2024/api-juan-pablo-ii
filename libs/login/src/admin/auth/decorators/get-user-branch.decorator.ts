import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '@prisma/prisma';
import { UserBranchData } from '@login/login/interfaces';

export const GetUserBranch = createParamDecorator(
  async (data, ctx: ExecutionContext): Promise<UserBranchData> => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    const prisma = new PrismaService();

    if (!user) throw new InternalServerErrorException('Usuario no encontrado');

    // Determinar el rol principal como string
    let rol = 'USER';
    if (user.isSuperAdmin) {
      rol = 'SUPER_ADMIN';
    } else if (user.roles && user.roles.length > 0) {
      // Priorizar MEDICO y ADMINISTRATIVO
      const medicoRole = user.roles.find((r) => r.name === 'MEDICO');
      const adminRole = user.roles.find((r) => r.name === 'ADMINISTRATIVO');

      if (medicoRole) {
        rol = 'MEDICO';
      } else if (adminRole) {
        rol = 'ADMINISTRATIVO';
      } else {
        rol = user.roles[0].name;
      }
    }

    // Datos básicos del usuario (formato específico solicitado)
    const userData: UserBranchData = {
      id: user.id,
      isSuperAdmin: user.isSuperAdmin,
      rol, // Solo un string, no un array
      staffId: null,
      branchId: null,
    };

    // Si no es superadmin, buscar si está asociado a un staff
    if (!user.isSuperAdmin && (rol === 'MEDICO' || rol === 'ADMINISTRATIVO')) {
      const staff = await prisma.staff.findFirst({
        where: {
          userId: user.id,
          isActive: true,
        },
        select: {
          id: true,
          branchId: true,
        },
      });

      if (staff) {
        userData.staffId = staff.id;
        userData.branchId = staff.branchId;
      }
    }

    return userData;
  },
);
