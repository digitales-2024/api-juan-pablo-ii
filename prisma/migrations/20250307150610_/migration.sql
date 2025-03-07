/*
  Warnings:

  - A unique constraint covering the columns `[name,isActive]` on the table `Categoria` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,isActive]` on the table `ServiceType` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,isActive]` on the table `StaffType` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,isActive]` on the table `TipoProducto` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,isActive]` on the table `TypeStorage` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Categoria_name_isActive_key" ON "Categoria"("name", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceType_name_isActive_key" ON "ServiceType"("name", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "StaffType_name_isActive_key" ON "StaffType"("name", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "TipoProducto_name_isActive_key" ON "TipoProducto"("name", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "TypeStorage_name_isActive_key" ON "TypeStorage"("name", "isActive");
