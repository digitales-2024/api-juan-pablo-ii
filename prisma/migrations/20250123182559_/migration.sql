-- DropForeignKey
ALTER TABLE "ServiceType" DROP CONSTRAINT "ServiceType_especialidadId_fkey";

-- AlterTable
ALTER TABLE "ServiceType" ALTER COLUMN "especialidadId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "ServiceType" ADD CONSTRAINT "ServiceType_especialidadId_fkey" FOREIGN KEY ("especialidadId") REFERENCES "Especialidad"("id") ON DELETE SET NULL ON UPDATE CASCADE;
