-- DropForeignKey
ALTER TABLE "ImagePatient" DROP CONSTRAINT "ImagePatient_imageUrl_fkey";

-- AddForeignKey
ALTER TABLE "ImagePatient" ADD CONSTRAINT "ImagePatient_updateHistoryId_fkey" FOREIGN KEY ("updateHistoryId") REFERENCES "UpdateHistory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
