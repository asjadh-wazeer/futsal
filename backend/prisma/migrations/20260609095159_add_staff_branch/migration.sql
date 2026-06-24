-- AlterTable
ALTER TABLE "admins" ADD COLUMN     "branchId" TEXT;

-- AddForeignKey
ALTER TABLE "admins" ADD CONSTRAINT "admins_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;
