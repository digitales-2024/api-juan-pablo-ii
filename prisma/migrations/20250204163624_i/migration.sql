-- AddForeignKey
ALTER TABLE "TypeStorage" ADD CONSTRAINT "TypeStorage_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;
