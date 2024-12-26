/*
  Warnings:

  - You are about to drop the column `productoId` on the `Storage` table. All the data in the column will be lost.
  - You are about to drop the column `stock` on the `Storage` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Storage" DROP CONSTRAINT "Storage_productoId_fkey";

-- AlterTable
ALTER TABLE "Storage" DROP COLUMN "productoId",
DROP COLUMN "stock";

-- CreateTable
CREATE TABLE "Stock" (
    "id" TEXT NOT NULL,
    "storageId" TEXT NOT NULL,
    "productoId" TEXT NOT NULL,
    "stock" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Stock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Stock_storageId_productoId_key" ON "Stock"("storageId", "productoId");

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_storageId_fkey" FOREIGN KEY ("storageId") REFERENCES "Storage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
