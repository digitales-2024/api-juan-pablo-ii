/*
  Warnings:

  - You are about to drop the `OrdenCompra` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "OrdenCompra" DROP CONSTRAINT "OrdenCompra_clientId_fkey";

-- DropForeignKey
ALTER TABLE "OrdenCompra" DROP CONSTRAINT "OrdenCompra_consultaMedicaId_fkey";

-- DropForeignKey
ALTER TABLE "Pago" DROP CONSTRAINT "Pago_ordenCompraId_fkey";

-- DropForeignKey
ALTER TABLE "TipoMovimiento" DROP CONSTRAINT "TipoMovimiento_ordenCompraId_fkey";

-- DropTable
DROP TABLE "OrdenCompra";

-- CreateTable
CREATE TABLE "Orden" (
    "id" TEXT NOT NULL,
    "tipo" TEXT,
    "referenciaId" TEXT,
    "estado" TEXT NOT NULL,
    "detalles" JSONB NOT NULL,
    "productos" JSONB,
    "servicios" JSONB,
    "total" DOUBLE PRECISION NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "descripcion" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Orden_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TipoMovimiento" ADD CONSTRAINT "TipoMovimiento_ordenCompraId_fkey" FOREIGN KEY ("ordenCompraId") REFERENCES "Orden"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pago" ADD CONSTRAINT "Pago_ordenCompraId_fkey" FOREIGN KEY ("ordenCompraId") REFERENCES "Orden"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
