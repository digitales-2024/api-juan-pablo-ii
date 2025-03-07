/*
  Warnings:

  - A unique constraint covering the columns `[name,isActive]` on the table `Branch` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Branch_name_isActive_key" ON "Branch"("name", "isActive");
