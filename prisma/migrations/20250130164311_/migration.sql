/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Categoria` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Producto` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `TipoProducto` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Categoria_name_key" ON "Categoria"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Producto_name_key" ON "Producto"("name");

-- CreateIndex
CREATE UNIQUE INDEX "TipoProducto_name_key" ON "TipoProducto"("name");
