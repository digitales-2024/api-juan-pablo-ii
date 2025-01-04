-- DropForeignKey
ALTER TABLE "Calendario" DROP CONSTRAINT "Calendario_personalId_fkey";

-- AlterTable
ALTER TABLE "Calendario" ALTER COLUMN "personalId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Calendario" ADD CONSTRAINT "Calendario_personalId_fkey" FOREIGN KEY ("personalId") REFERENCES "Personal"("id") ON DELETE SET NULL ON UPDATE CASCADE;
