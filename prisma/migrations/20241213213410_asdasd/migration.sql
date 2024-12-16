/*
  Warnings:

  - You are about to drop the `Orden` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Pago` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Pago" DROP CONSTRAINT "Pago_ordenCompraId_fkey";

-- DropForeignKey
ALTER TABLE "TipoMovimiento" DROP CONSTRAINT "TipoMovimiento_ordenCompraId_fkey";

-- DropTable
DROP TABLE "Orden";

-- DropTable
DROP TABLE "Pago";

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "type" TEXT,
    "referenceId" TEXT,
    "status" TEXT NOT NULL,
    "details" JSONB NOT NULL,
    "products" JSONB,
    "services" JSONB,
    "total" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TipoMovimiento" ADD CONSTRAINT "TipoMovimiento_ordenCompraId_fkey" FOREIGN KEY ("ordenCompraId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
