/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Storage` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `TypeStorage` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Storage_name_key" ON "Storage"("name");

-- CreateIndex
CREATE UNIQUE INDEX "TypeStorage_name_key" ON "TypeStorage"("name");
