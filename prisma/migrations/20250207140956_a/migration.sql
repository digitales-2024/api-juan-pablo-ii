-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_staffScheduleId_fkey";

-- AlterTable
ALTER TABLE "Event" ALTER COLUMN "staffScheduleId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_staffScheduleId_fkey" FOREIGN KEY ("staffScheduleId") REFERENCES "StaffSchedule"("id") ON DELETE SET NULL ON UPDATE CASCADE;
