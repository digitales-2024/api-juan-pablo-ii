-- DropForeignKey
ALTER TABLE "StaffSchedule" DROP CONSTRAINT "StaffSchedule_branchId_fkey";

-- DropForeignKey
ALTER TABLE "StaffSchedule" DROP CONSTRAINT "StaffSchedule_staffId_fkey";

-- AddForeignKey
ALTER TABLE "StaffSchedule" ADD CONSTRAINT "StaffSchedule_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffSchedule" ADD CONSTRAINT "StaffSchedule_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
