/*
  Warnings:

  - The `vacunas` column on the `Paciente` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Paciente" DROP COLUMN "vacunas",
ADD COLUMN     "vacunas" JSONB;
