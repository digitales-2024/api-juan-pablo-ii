-- DropForeignKey
ALTER TABLE "Personal" DROP CONSTRAINT "Personal_userId_fkey";

-- AlterTable
ALTER TABLE "Personal" ALTER COLUMN "userId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Personal" ADD CONSTRAINT "Personal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
