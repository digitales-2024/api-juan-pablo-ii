/*
  Warnings:

  - Added the required column `email` to the `Personal` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Personal" ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "phone" TEXT;
