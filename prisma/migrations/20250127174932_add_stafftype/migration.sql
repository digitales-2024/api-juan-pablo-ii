/*
  Warnings:

  - You are about to drop the column `personalId` on the `Calendario` table. All the data in the column will be lost.
  - You are about to drop the column `personalId` on the `CitaMedica` table. All the data in the column will be lost.
  - You are about to drop the column `especialidadId` on the `ServiceType` table. All the data in the column will be lost.
  - You are about to drop the `Especialidad` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Personal` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `staffId` to the `CitaMedica` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Calendario" DROP CONSTRAINT "Calendario_personalId_fkey";

-- DropForeignKey
ALTER TABLE "CitaMedica" DROP CONSTRAINT "CitaMedica_personalId_fkey";

-- DropForeignKey
ALTER TABLE "Personal" DROP CONSTRAINT "Personal_especialidadId_fkey";

-- DropForeignKey
ALTER TABLE "ServiceType" DROP CONSTRAINT "ServiceType_especialidadId_fkey";

-- AlterTable
ALTER TABLE "Calendario" DROP COLUMN "personalId",
ADD COLUMN     "staffId" TEXT;

-- AlterTable
ALTER TABLE "CitaMedica" DROP COLUMN "personalId",
ADD COLUMN     "staffId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ServiceType" DROP COLUMN "especialidadId";

-- DropTable
DROP TABLE "Especialidad";

-- DropTable
DROP TABLE "Personal";

-- CreateTable
CREATE TABLE "StaffType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StaffType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Staff" (
    "id" TEXT NOT NULL,
    "staffTypeId" TEXT NOT NULL,
    "userId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "lastName" TEXT NOT NULL,
    "dni" TEXT NOT NULL,
    "birth" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Staff_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StaffType_id_key" ON "StaffType"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Staff_id_key" ON "Staff"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Staff_dni_key" ON "Staff"("dni");

-- AddForeignKey
ALTER TABLE "Staff" ADD CONSTRAINT "Staff_staffTypeId_fkey" FOREIGN KEY ("staffTypeId") REFERENCES "StaffType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Calendario" ADD CONSTRAINT "Calendario_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CitaMedica" ADD CONSTRAINT "CitaMedica_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
