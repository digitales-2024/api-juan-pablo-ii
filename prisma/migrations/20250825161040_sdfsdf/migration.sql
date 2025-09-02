/*
  Warnings:

  - You are about to drop the `ScheduleDay` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `branchId` to the `StaffSchedule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endTime` to the `StaffSchedule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recurrence` to the `StaffSchedule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startTime` to the `StaffSchedule` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ScheduleDay" DROP CONSTRAINT "ScheduleDay_branchId_fkey";

-- DropForeignKey
ALTER TABLE "ScheduleDay" DROP CONSTRAINT "ScheduleDay_scheduleId_fkey";

-- DropIndex
DROP INDEX "StaffSchedule_staffId_idx";

-- AlterTable
ALTER TABLE "StaffSchedule" ADD COLUMN     "branchId" TEXT NOT NULL,
ADD COLUMN     "daysOfWeek" "DayOfWeek"[],
ADD COLUMN     "endTime" TEXT NOT NULL,
ADD COLUMN     "exceptions" TEXT[],
ADD COLUMN     "recurrence" JSONB NOT NULL,
ADD COLUMN     "startTime" TEXT NOT NULL,
ALTER COLUMN "title" SET DEFAULT 'Turno';

-- DropTable
DROP TABLE "ScheduleDay";

-- DropEnum
DROP TYPE "ShiftType";

-- CreateIndex
CREATE INDEX "StaffSchedule_staffId_branchId_idx" ON "StaffSchedule"("staffId", "branchId");

-- AddForeignKey
ALTER TABLE "StaffSchedule" ADD CONSTRAINT "StaffSchedule_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
