/*
  Warnings:

  - You are about to drop the column `prescription` on the `Prescription` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Prescription" DROP COLUMN "prescription",
ADD COLUMN     "prescriptionMedicaments" JSONB,
ADD COLUMN     "prescriptionServices" JSONB;
