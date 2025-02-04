-- AddForeignKey
ALTER TABLE "TypeStorage" ADD CONSTRAINT "TypeStorage_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TypeStorage" ADD CONSTRAINT "TypeStorage_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;
