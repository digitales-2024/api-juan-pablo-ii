/*
  Warnings:

  - You are about to drop the column `dueDate` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `referenceCode` on the `Payment` table. All the data in the column will be lost.
  - Added the required column `paymentMethod` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'BANK_TRANSFER', 'YAPE');

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "dueDate",
ALTER COLUMN "date" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "date" SET DATA TYPE TIMESTAMPTZ(6);

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "referenceCode",
ADD COLUMN     "paymentMethod" "PaymentMethod" NOT NULL,
ADD COLUMN     "verifiedAt" TIMESTAMP(3),
ADD COLUMN     "verifiedBy" TEXT,
ADD COLUMN     "voucherNumber" TEXT,
ALTER COLUMN "date" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "date" SET DATA TYPE TIMESTAMPTZ(6);
