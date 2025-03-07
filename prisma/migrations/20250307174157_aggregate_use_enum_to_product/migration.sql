/*
  Warnings:

  - The `uso` column on the `Producto` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "ProductUse" AS ENUM ('VENTA', 'INTERNO', 'OTRO');

-- AlterTable
ALTER TABLE "Producto" DROP COLUMN "uso",
ADD COLUMN     "uso" "ProductUse";
