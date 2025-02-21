-- AlterTable
ALTER TABLE "Incoming" ADD COLUMN     "isTransference" BOOLEAN DEFAULT false;

-- AlterTable
ALTER TABLE "Movement" ADD COLUMN     "buyingPrice" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Outgoing" ADD COLUMN     "isTransference" BOOLEAN DEFAULT false;
