/*
  Warnings:

  - You are about to drop the column `branchId` on the `TypeStorage` table. All the data in the column will be lost.
  - You are about to drop the column `staffId` on the `TypeStorage` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "TypeStorage" DROP CONSTRAINT "TypeStorage_branchId_fkey";

-- DropForeignKey
ALTER TABLE "TypeStorage" DROP CONSTRAINT "TypeStorage_staffId_fkey";

-- AlterTable
ALTER TABLE "Storage" ADD COLUMN     "branchId" TEXT,
ADD COLUMN     "staffId" TEXT;

-- AlterTable
ALTER TABLE "TypeStorage" DROP COLUMN "branchId",
DROP COLUMN "staffId";

-- AddForeignKey
ALTER TABLE "Storage" ADD CONSTRAINT "Storage_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Storage" ADD CONSTRAINT "Storage_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;
