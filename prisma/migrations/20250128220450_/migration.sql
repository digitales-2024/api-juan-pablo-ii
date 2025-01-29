/*
  Warnings:

  - You are about to drop the `Calendario` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Evento` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Recurrencia` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "CalendarType" AS ENUM ('PERSONAL', 'CITAS_MEDICAS', 'CONSULTAS_MEDICAS');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('CITA_MEDICA', 'CONTROL_MEDICO', 'INGRESO', 'SALIDA', 'ALMUERZO', 'DESCANSO', 'PERMISO');

-- CreateEnum
CREATE TYPE "PermissionType" AS ENUM ('MEDICO', 'PERSONAL', 'VACACIONES');

-- CreateEnum
CREATE TYPE "PermissionStatus" AS ENUM ('PENDIENTE', 'APROBADO', 'RECHAZADO');

-- CreateEnum
CREATE TYPE "RecurrenceFrequency" AS ENUM ('DIARIA', 'SEMANAL', 'MENSUAL', 'ANUAL');

-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO');

-- DropForeignKey
ALTER TABLE "Calendario" DROP CONSTRAINT "Calendario_staffId_fkey";

-- DropForeignKey
ALTER TABLE "Evento" DROP CONSTRAINT "Evento_calendarioId_fkey";

-- DropForeignKey
ALTER TABLE "Recurrencia" DROP CONSTRAINT "Recurrencia_calendarioId_fkey";

-- DropTable
DROP TABLE "Calendario";

-- DropTable
DROP TABLE "Evento";

-- DropTable
DROP TABLE "Recurrencia";

-- CreateTable
CREATE TABLE "Calendar" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "CalendarType" NOT NULL,
    "medicalAppointmentId" TEXT,
    "medicalConsultationId" TEXT,
    "staffId" TEXT,
    "branchId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Calendar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "calendarId" TEXT NOT NULL,
    "type" "EventType" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "color" TEXT,
    "permissionType" "PermissionType",
    "permissionStatus" "PermissionStatus",
    "duration" INTEGER,
    "patientId" TEXT,
    "staffId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "recurrenceId" TEXT,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recurrence" (
    "id" TEXT NOT NULL,
    "frequency" "RecurrenceFrequency",
    "interval" INTEGER,
    "daysOfWeek" "DayOfWeek"[],
    "exceptions" "DayOfWeek"[],
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Recurrence_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_calendarId_fkey" FOREIGN KEY ("calendarId") REFERENCES "Calendar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_recurrenceId_fkey" FOREIGN KEY ("recurrenceId") REFERENCES "Recurrence"("id") ON DELETE SET NULL ON UPDATE CASCADE;
