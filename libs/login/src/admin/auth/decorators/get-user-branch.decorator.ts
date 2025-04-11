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

    // Datos básicos del usuario
    const userData: UserBranchData = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      isSuperAdmin: user.isSuperAdmin,
      roles: user.roles,
      staffId: null,
      branchId: null,
    };

    // Si es superadmin, no necesitamos buscar información de staff
    if (user.isSuperAdmin) {
      return userData;
    }

    // Verificamos si es ADMINISTRATIVO o MEDICO buscando en los roles
    const isAdminOrMedico = user.roles.some(
      (rol) => rol.name === 'ADMINISTRATIVO' || rol.name === 'MEDICO',
    );

    if (isAdminOrMedico) {
      // Buscamos si existe un staff asociado a este usuario
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
