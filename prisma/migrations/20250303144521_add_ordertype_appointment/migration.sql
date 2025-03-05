/*
  Warnings:

  - The values [MEDICAL_CONSULTATION_ORDER] on the enum `OrderType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "OrderType_new" AS ENUM ('MEDICAL_PRESCRIPTION_ORDER', 'MEDICAL_APPOINTMENt_ORDER', 'PRODUCT_SALE_ORDER', 'PRODUCT_PURCHASE_ORDER');
ALTER TABLE "Order" ALTER COLUMN "type" TYPE "OrderType_new" USING ("type"::text::"OrderType_new");
ALTER TYPE "OrderType" RENAME TO "OrderType_old";
ALTER TYPE "OrderType_new" RENAME TO "OrderType";
DROP TYPE "OrderType_old";
COMMIT;
