-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AppointmentStatus" ADD VALUE 'CONFIRMED';
ALTER TYPE "AppointmentStatus" ADD VALUE 'COMPLETED';
ALTER TYPE "AppointmentStatus" ADD VALUE 'CANCELLED';
ALTER TYPE "AppointmentStatus" ADD VALUE 'NO_SHOW';
ALTER TYPE "AppointmentStatus" ADD VALUE 'RESCHEDULED';

-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "appointmentId" TEXT,
ADD COLUMN     "cancellationReason" TEXT,
ADD COLUMN     "rescheduledFromId" TEXT;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_rescheduledFromId_fkey" FOREIGN KEY ("rescheduledFromId") REFERENCES "Appointment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
