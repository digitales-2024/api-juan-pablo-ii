-- CreateIndex
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX "Producto_name_idx" ON "Producto" USING GIN ("name" gin_trgm_ops);
