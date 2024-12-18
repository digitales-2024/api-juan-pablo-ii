/*
  Warnings:

  - You are about to drop the column `description` on the `Order` table. All the data in the column will be lost.
  - Added the required column `currency` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `movementTypeId` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subtotal` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tax` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `status` on the `Order` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "OrderType" AS ENUM ('SERVICE_BILLING', 'RECIPE_BILLING');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('DRAFT', 'PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED', 'REFUNDED');

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "description",
ADD COLUMN     "code" TEXT,
ADD COLUMN     "currency" TEXT NOT NULL,
ADD COLUMN     "dueDate" TIMESTAMP(3),
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "movementTypeId" TEXT NOT NULL,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "sourceId" TEXT,
ADD COLUMN     "subtotal" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "targetId" TEXT,
ADD COLUMN     "tax" DOUBLE PRECISION NOT NULL,
DROP COLUMN "type",
ADD COLUMN     "type" "OrderType" NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "OrderStatus" NOT NULL;
