/*
  Warnings:

  - You are about to drop the `HistoriaMedica` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Paciente` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RecetaMedica` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UpdateHistoria` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ConsultaMedica" DROP CONSTRAINT "ConsultaMedica_pacienteId_fkey";

-- DropForeignKey
ALTER TABLE "HistoriaMedica" DROP CONSTRAINT "HistoriaMedica_pacienteId_fkey";

-- DropForeignKey
ALTER TABLE "RecetaMedica" DROP CONSTRAINT "RecetaMedica_updateHistoriaId_fkey";

-- DropForeignKey
ALTER TABLE "UpdateHistoria" DROP CONSTRAINT "UpdateHistoria_historiaMedicaId_fkey";

-- DropTable
DROP TABLE "HistoriaMedica";

-- DropTable
DROP TABLE "Paciente";

-- DropTable
DROP TABLE "RecetaMedica";

-- DropTable
DROP TABLE "UpdateHistoria";

-- CreateTable
CREATE TABLE "Patient" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "lastName" TEXT,
    "dni" TEXT NOT NULL,
    "birthDate" VARCHAR(20),
    "gender" BOOLEAN NOT NULL,
    "address" VARCHAR(255),
    "phone" VARCHAR(15),
    "email" VARCHAR(100),
    "registrationDate" VARCHAR(20) NOT NULL,
    "allergies" TEXT,
    "currentMedications" TEXT,
    "emergencyContact" VARCHAR(100),
    "emergencyPhone" VARCHAR(15),
    "healthInsurance" VARCHAR(100),
    "maritalStatus" VARCHAR(20),
    "occupation" VARCHAR(100),
    "workplace" VARCHAR(255),
    "bloodType" VARCHAR(3),
    "familyHistory" TEXT,
    "lifestyleHabits" TEXT,
    "vaccinations" JSONB,
    "primaryDoctor" VARCHAR(100),
    "language" VARCHAR(50),
    "treatmentAuthorization" VARCHAR(255),
    "notes" TEXT,
    "patientPhoto" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Patient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MedicalHistory" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "medicalHistory" JSONB NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MedicalHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UpdateHistory" (
    "id" TEXT NOT NULL,
    "medicalConsultationId" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "medicalHistoryId" TEXT NOT NULL,
    "prescription" BOOLEAN NOT NULL DEFAULT false,
    "prescriptionId" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "updateHistory" JSONB NOT NULL,
    "description" TEXT,
    "medicalLeave" BOOLEAN NOT NULL DEFAULT false,
    "leaveDescription" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UpdateHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prescription" (
    "id" TEXT NOT NULL,
    "updateHistoryId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "registrationDate" TIMESTAMP(3) NOT NULL,
    "prescription" JSONB NOT NULL,
    "description" TEXT,
    "purchaseOrderId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Prescription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Patient_id_key" ON "Patient"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Patient_dni_key" ON "Patient"("dni");

-- AddForeignKey
ALTER TABLE "MedicalHistory" ADD CONSTRAINT "MedicalHistory_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UpdateHistory" ADD CONSTRAINT "UpdateHistory_medicalHistoryId_fkey" FOREIGN KEY ("medicalHistoryId") REFERENCES "MedicalHistory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prescription" ADD CONSTRAINT "Prescription_updateHistoryId_fkey" FOREIGN KEY ("updateHistoryId") REFERENCES "UpdateHistory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsultaMedica" ADD CONSTRAINT "ConsultaMedica_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
