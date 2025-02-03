/*
  Warnings:

  - You are about to drop the `Sucursal` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ConsultaMedica" DROP CONSTRAINT "ConsultaMedica_sucursalId_fkey";

-- DropTable
DROP TABLE "Sucursal";

-- CreateTable
CREATE TABLE "Branch" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phone" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Branch_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ConsultaMedica" ADD CONSTRAINT "ConsultaMedica_sucursalId_fkey" FOREIGN KEY ("sucursalId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
