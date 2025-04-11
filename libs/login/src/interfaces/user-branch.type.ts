import { UserData } from './user.type';

export type UserBranchData = UserData & {
  staffId: string | null;
  branchId: string | null;
};
