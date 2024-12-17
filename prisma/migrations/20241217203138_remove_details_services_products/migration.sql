/*
  Warnings:

  - You are about to drop the column `details` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `products` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `services` on the `Order` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "details",
DROP COLUMN "products",
DROP COLUMN "services";
