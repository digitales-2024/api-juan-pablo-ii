-- AlterTable
ALTER TABLE "Incoming" ADD COLUMN     "outgoingId" TEXT;

-- AlterTable
ALTER TABLE "Outgoing" ADD COLUMN     "incomingId" TEXT;
