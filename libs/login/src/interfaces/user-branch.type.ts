import { UserData } from './user.type';

export type UserBranchSimple = UserData & {
  staffId: string | null;
  branchId: string | null;
};

export type UserBranchData = {
  id: string;
  isSuperAdmin: boolean;
  rol: string; // Un único string, no un array
  staffId: string | null;
  branchId: string | null;
};

/*  AppointmentService ~ userBranch: {
    id: '6d7c4e62-68b2-446e-8859-55cfc7c94301',
    isSuperAdmin: true,
    rol: SUPER_ADMIN,
    staffId: null,
    branchId: null
  } */
