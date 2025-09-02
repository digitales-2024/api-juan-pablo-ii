/*
  Warnings:

  - You are about to drop the column `branchId` on the `StaffSchedule` table. All the data in the column will be lost.
  - You are about to drop the column `daysOfWeek` on the `StaffSchedule` table. All the data in the column will be lost.
  - You are about to drop the column `endTime` on the `StaffSchedule` table. All the data in the column will be lost.
  - You are about to drop the column `exceptions` on the `StaffSchedule` table. All the data in the column will be lost.
  - You are about to drop the column `recurrence` on the `StaffSchedule` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `StaffSchedule` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ShiftType" AS ENUM ('MORNING', 'AFTERNOON', 'FULL_DAY', 'CUSTOM');

-- DropForeignKey
ALTER TABLE "StaffSchedule" DROP CONSTRAINT "StaffSchedule_branchId_fkey";

-- DropIndex
DROP INDEX "StaffSchedule_staffId_branchId_idx";

-- AlterTable
ALTER TABLE "StaffSchedule" DROP COLUMN "branchId",
DROP COLUMN "daysOfWeek",
DROP COLUMN "endTime",
DROP COLUMN "exceptions",
DROP COLUMN "recurrence",
DROP COLUMN "startTime",
ALTER COLUMN "title" SET DEFAULT 'Horario de Trabajo';

-- CreateTable
CREATE TABLE "ScheduleDay" (
    "id" TEXT NOT NULL,
    "scheduleId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "shiftType" "ShiftType" NOT NULL,
    "branchId" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScheduleDay_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ScheduleDay_scheduleId_date_idx" ON "ScheduleDay"("scheduleId", "date");

-- CreateIndex
CREATE INDEX "ScheduleDay_branchId_date_idx" ON "ScheduleDay"("branchId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "ScheduleDay_scheduleId_date_shiftType_key" ON "ScheduleDay"("scheduleId", "date", "shiftType");

-- CreateIndex
CREATE INDEX "StaffSchedule_staffId_idx" ON "StaffSchedule"("staffId");

-- AddForeignKey
ALTER TABLE "ScheduleDay" ADD CONSTRAINT "ScheduleDay_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "StaffSchedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleDay" ADD CONSTRAINT "ScheduleDay_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
