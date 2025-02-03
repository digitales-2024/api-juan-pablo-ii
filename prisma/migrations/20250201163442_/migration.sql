/*
  Warnings:

  - Added the required column `patientId` to the `UpdateHistory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UpdateHistory" ADD COLUMN     "patientId" TEXT NOT NULL;
