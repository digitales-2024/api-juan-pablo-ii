/*
  Warnings:

  - You are about to drop the column `isActive` on the `Especialidad` table. All the data in the column will be lost.
  - The `vacunas` column on the `Paciente` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `Cronograma` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Horario` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `email` to the `Personal` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Cronograma" DROP CONSTRAINT "Cronograma_horarioId_fkey";

-- DropForeignKey
ALTER TABLE "Cronograma" DROP CONSTRAINT "Cronograma_personalId_fkey";

-- DropForeignKey
ALTER TABLE "Personal" DROP CONSTRAINT "Personal_userId_fkey";

-- AlterTable
ALTER TABLE "Especialidad" DROP COLUMN "isActive";

-- AlterTable
ALTER TABLE "Paciente" DROP COLUMN "vacunas",
ADD COLUMN     "vacunas" JSONB;

-- AlterTable
ALTER TABLE "Personal" ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "phone" TEXT,
ALTER COLUMN "userId" DROP NOT NULL;

-- DropTable
DROP TABLE "Cronograma";

-- DropTable
DROP TABLE "Horario";

-- CreateTable
CREATE TABLE "Calendario" (
    "id" TEXT NOT NULL,
    "personalId" TEXT NOT NULL,
    "sucursalId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "color" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Calendario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Evento" (
    "id" TEXT NOT NULL,
    "calendarioId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "fechaInicio" TEXT NOT NULL,
    "fechaFin" TEXT NOT NULL,
    "todoElDia" BOOLEAN NOT NULL DEFAULT false,
    "tipo" TEXT NOT NULL,
    "color" TEXT,
    "esPermiso" BOOLEAN NOT NULL DEFAULT false,
    "tipoPermiso" TEXT,
    "estadoPermiso" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Evento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recurrencia" (
    "id" TEXT NOT NULL,
    "calendarioId" TEXT NOT NULL,
    "frecuencia" TEXT NOT NULL,
    "intervalo" INTEGER NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Recurrencia_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Calendario" ADD CONSTRAINT "Calendario_personalId_fkey" FOREIGN KEY ("personalId") REFERENCES "Personal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evento" ADD CONSTRAINT "Evento_calendarioId_fkey" FOREIGN KEY ("calendarioId") REFERENCES "Calendario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recurrencia" ADD CONSTRAINT "Recurrencia_calendarioId_fkey" FOREIGN KEY ("calendarioId") REFERENCES "Calendario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
