/*
  Warnings:

  - Made the column `staffScheduleId` on table `Event` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_staffScheduleId_fkey";

-- AlterTable
ALTER TABLE "Event" ALTER COLUMN "staffScheduleId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_staffScheduleId_fkey" FOREIGN KEY ("staffScheduleId") REFERENCES "StaffSchedule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
