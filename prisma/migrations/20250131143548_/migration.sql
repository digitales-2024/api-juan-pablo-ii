/*
  Warnings:

  - You are about to drop the column `date` on the `MedicalHistory` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `UpdateHistory` table. All the data in the column will be lost.
  - You are about to drop the column `medicalConsultationId` on the `UpdateHistory` table. All the data in the column will be lost.
  - Added the required column `serviceId` to the `UpdateHistory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MedicalHistory" DROP COLUMN "date",
ALTER COLUMN "medicalHistory" DROP NOT NULL;

-- AlterTable
ALTER TABLE "UpdateHistory" DROP COLUMN "date",
DROP COLUMN "medicalConsultationId",
ADD COLUMN     "medicalLeaveDays" INTEGER,
ADD COLUMN     "medicalLeaveEndDate" TIMESTAMP(3),
ADD COLUMN     "medicalLeaveStartDate" TIMESTAMP(3),
ADD COLUMN     "serviceId" TEXT NOT NULL,
ALTER COLUMN "updateHistory" DROP NOT NULL;

-- CreateTable
CREATE TABLE "ImagePatient" (
    "id" TEXT NOT NULL,
    "updateHistoryId" TEXT,
    "patientId" TEXT,
    "imageUrl" TEXT,
    "phothography" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ImagePatient_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ImagePatient" ADD CONSTRAINT "ImagePatient_imageUrl_fkey" FOREIGN KEY ("imageUrl") REFERENCES "UpdateHistory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
