-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "cancelledAt" TIMESTAMP(3),
ADD COLUMN     "cancelledByName" TEXT,
ADD COLUMN     "createdByName" TEXT;
