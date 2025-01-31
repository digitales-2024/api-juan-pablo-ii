/*
  Warnings:

  - You are about to drop the column `recurrenceId` on the `Appointment` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "AppointmentType" AS ENUM ('CONSULTA', 'OTRO');

-- DropForeignKey
ALTER TABLE "Appointment" DROP CONSTRAINT "Appointment_recurrenceId_fkey";

-- AlterTable
ALTER TABLE "Appointment" DROP COLUMN "recurrenceId",
ADD COLUMN     "type" "AppointmentType" NOT NULL DEFAULT 'CONSULTA';
