/*
  Warnings:

  - You are about to drop the column `language` on the `Patient` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Patient" DROP COLUMN "language",
ADD COLUMN     "sucursal" VARCHAR(50);
